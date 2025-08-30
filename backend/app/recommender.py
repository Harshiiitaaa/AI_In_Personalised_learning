import pandas as pd
from pathlib import Path
from typing import List, Optional, Set
import random

# --- Machine Learning Imports ---
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler
from sklearn.neighbors import NearestNeighbors
from scipy.sparse import hstack
import numpy as np

# --- Constants and Global Variables for Caching ---
DATA_PATH = Path(__file__).resolve().parent.parent / "dataset" / "leetcode_dataset.csv"

_df = None
_nn_model = None
_title_to_index = None
_combined_features = None

# --- Helper Functions ---
def clean_and_split(text: str) -> List[str]:
    if not isinstance(text, str): return []
    return [item.strip().lower() for item in text.split(',') if item.strip()]

# --- Core Model Building ---
# In backend/app/recommender.py

def build_model():
    """
    Loads the dataset, cleans it, and builds the recommendation model.
    This function is cached and only runs once.
    """
    global _df, _nn_model, _title_to_index, _combined_features
    if _df is not None: return
    try:
        df = pd.read_csv(DATA_PATH)
        if '_id' not in df.columns:
            df['_id'] = [str(i) for i in range(len(df))]
    except FileNotFoundError:
        print(f"ERROR: Dataset not found at {DATA_PATH}")
        _df = pd.DataFrame()
        return

    # --- Data Cleaning (No changes needed here) ---
    rename_map = { "name": ["title", "question", "name"], "difficulty": ["difficulty", "level"], "company": ["company", "companies"], "topic": ["topic", "tag", "tags", "related_topics"],}
    current_cols = {c.lower().strip().replace('_', ' '): c for c in df.columns}
    final_rename = {}
    for standard_name, potential_names in rename_map.items():
        for potential_name in potential_names:
            if potential_name in current_cols:
                final_rename[current_cols[potential_name]] = standard_name
                break
    if final_rename:
        df = df.rename(columns=final_rename)
    
    df['topic'] = df.get('topic', pd.Series(dtype='str')).fillna('')
    df['company'] = df.get('company', pd.Series(dtype='str')).fillna('')
    df['topic_list'] = df['topic'].apply(clean_and_split)
    df['company_list'] = df['company'].apply(clean_and_split)
    difficulty_mapping = {'Easy': 0, 'Medium': 1, 'Hard': 2}
    df['difficulty_numeric'] = df.get('difficulty', pd.Series(dtype='str')).map(difficulty_mapping).fillna(0)
    df['topic_clean_str'] = df['topic_list'].apply(lambda x: ' '.join(x))

    # --- ✅ FIXED: Topic Vectorization is now conditional ---
    topic_vectors = None
    # Only try to create topic vectors if there is actual text in the column
    if df['topic_clean_str'].str.strip().astype(bool).any():
        try:
            tfidf = TfidfVectorizer(min_df=1)
            topic_vectors = tfidf.fit_transform(df['topic_clean_str'])
            print("Successfully built topic vectors.")
        except ValueError:
            print("WARNING: Could not build topic vocabulary. Proceeding without topic data.")
            topic_vectors = None
    else:
        print("INFO: No topic data found. Proceeding without topic vectors.")
    # --- END OF FIX ---

    # --- Feature Scaling and Combination (No changes needed here) ---
    scaler = MinMaxScaler()
    numerical_features_cols = ['acceptance_rate', 'frequency', 'rating', 'difficulty_numeric']
    for col in numerical_features_cols:
        if col not in df.columns: df[col] = 0
    numerical_features = df[numerical_features_cols].astype(float).fillna(0)
    scaled_numerical_features = scaler.fit_transform(numerical_features)
    
    # Conditionally combine features
    if topic_vectors is not None:
        _combined_features = hstack([topic_vectors, scaled_numerical_features]).tocsr()
    else:
        # If no topics, just use the numerical features
        _combined_features = scaled_numerical_features

    # --- Model Fitting (No changes needed here) ---
    _nn_model = NearestNeighbors(n_neighbors=50, algorithm='brute', metric='cosine')
    _nn_model.fit(_combined_features)
    
    _df = df
    if 'name' in df.columns:
        _title_to_index = pd.Series(_df.index, index=_df['name'])


def _get_recommendations(start_question_title: str, k: int = 50) -> pd.DataFrame:
    if _title_to_index is None or _nn_model is None: return pd.DataFrame()
    try:
        idx = _title_to_index[start_question_title]
    except KeyError:
        return pd.DataFrame()
        
    query_vector = _combined_features[idx].reshape(1, -1)
    distances, indices = _nn_model.kneighbors(query_vector, n_neighbors=k + 1)
    similar_indices = indices.flatten()[1:]
    return _df.iloc[similar_indices]

# --- API-Facing Functions ---
def get_initial_questions(company: Optional[str] = None, topic: Optional[str] = None, solved_question_names: Set[str] = None) -> List[dict]:
    if _df is None: build_model()
    if _df.empty: return []
    q = _df.copy()
    if company: q = q[q['company_list'].apply(lambda lst: company.lower() in lst)]
    if topic: q = q[q['topic_list'].apply(lambda lst: topic.lower() in lst)]
    if solved_question_names: q = q[~q['name'].isin(solved_question_names)]

    easy_questions = q[q['difficulty'] == 'Easy']
    if easy_questions.empty: return []
    return easy_questions.sample(min(len(easy_questions), 2)).fillna("").to_dict(orient="records")


def _calculate_confidence_score(recent_attempts: List[dict]) -> int:
    """Calculates a confidence score based on the user's recent performance."""
    if not recent_attempts: return 0

    score = 0
    FAST_EASY_SECS = 5 * 60
    FAST_MEDIUM_SECS = 15 * 60
    FAST_HARD_SECS = 30 * 60

    for attempt in recent_attempts:
        # --- ✅ THIS IS THE KEY CHANGE ---
        # The line that looked up data in the CSV file is now gone.
        # We get the difficulty directly from the 'attempt' dictionary.
        difficulty = attempt.get('difficulty')
        duration = attempt.get('duration_seconds', 0)
        status = attempt.get('status', '').lower()
        # --- END OF CHANGE ---

        if not difficulty:
            continue 

        if status == 'accepted':
            if difficulty == 'Hard': score += 20 if duration < FAST_HARD_SECS else 10
            elif difficulty == 'Medium': score += 10 if duration < FAST_MEDIUM_SECS else 5
            elif difficulty == 'Easy': score += 5
        else:
            score -= 10
            
    return score


def next_question(prev_row: dict, result: str, duration_minutes: float, recent_attempts: List[dict], solved_question_names: Set[str] = None) -> Optional[dict]:
    """Recommends the next question using a Level 3 confidence score."""
    if _nn_model is None: build_model()
    if _df is None or _df.empty: return None

    confidence_score = _calculate_confidence_score(recent_attempts)
    print(f"User confidence score: {confidence_score}")

    prev_title = prev_row.get("name")
    prev_difficulty = prev_row.get("difficulty")
    prev_topics = prev_row.get("topic_list", [])
    if not prev_title or not prev_difficulty: return None

    recs = _get_recommendations(prev_title)
    if solved_question_names:
        recs = recs[~recs['name'].isin(solved_question_names)]
    
    def find_next(difficulties: List[str]) -> Optional[pd.DataFrame]:
        for diff in difficulties:
            # First, try to find a similar question of the target difficulty
            q = recs[recs['difficulty'] == diff].head(1)
            if not q.empty:
                return q
            
            # If not found, find ANY unsolved question of that difficulty
            unsolved_mask = ~_df['name'].isin(solved_question_names if solved_question_names else set())
            difficulty_mask = _df['difficulty'] == diff
            
            if prev_topics:
                topic_mask = _df['topic_list'].apply(lambda x: any(topic in x for topic in prev_topics))
                fallback_q = _df[topic_mask & unsolved_mask & difficulty_mask]
            else:
                fallback_q = _df[unsolved_mask & difficulty_mask]

            if not fallback_q.empty:
                return fallback_q.sample(1)
        return None

    next_q = None
    if confidence_score > 60:
        print("Strategy: Aggressive")
        if prev_difficulty == 'Easy': next_q = find_next(['Hard', 'Medium'])
        else: next_q = find_next(['Hard'])
    
    elif confidence_score > 20:
        print("Strategy: Standard (Level 2 Logic)")
        user_succeeded = result.lower() == "accepted"
        if prev_difficulty == 'Easy':
            if user_succeeded and duration_minutes < 5: next_q = find_next(['Medium', 'Hard'])
            else: next_q = find_next(['Easy'])
        elif prev_difficulty == 'Medium':
            if user_succeeded:
                if duration_minutes < 15: next_q = find_next(['Hard'])
                else: next_q = find_next(['Medium', 'Easy'])
            else: next_q = find_next(['Easy'])
        elif prev_difficulty == 'Hard':
            if user_succeeded:
                if duration_minutes < 30: next_q = find_next(['Hard'])
                else: next_q = find_next(['Medium'])
            else: next_q = find_next(['Medium', 'Easy'])
    else:
        print("Strategy: Conservative")
        if prev_difficulty == 'Hard': next_q = find_next(['Easy', 'Medium'])
        else: next_q = find_next(['Easy'])

    # Final Fallback Logic
    if next_q is not None and not next_q.empty:
        return next_q.iloc[0].fillna("").to_dict()
    elif not recs.empty:
        return recs.head(1).iloc[0].fillna("").to_dict()
    else:
        unsolved = _df[~_df['name'].isin(solved_question_names if solved_question_names else set())]
        if not unsolved.empty:
            return unsolved.sample(1).iloc[0].fillna("").to_dict()
            
    return None
