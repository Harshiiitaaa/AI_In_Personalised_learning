import pandas as pd
from pathlib import Path
from typing import List, Optional

# --- Machine Learning Imports ---
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler
from sklearn.neighbors import NearestNeighbors
from scipy.sparse import hstack
import numpy as np

# --- Constants and Global Variables for Caching ---
DATA_PATH = Path(__file__).resolve().parent.parent / "dataset" / "leetcode_dataset.csv"

# These globals will hold our trained model and data to avoid rebuilding on every API call
_df = None
_nn_model = None
_title_to_index = None
_combined_features = None

# --- Helper Functions ---

def clean_and_split(text: str) -> List[str]:
    """Splits a string by commas and cleans up whitespace from each item."""
    if not isinstance(text, str):
        return []
    items = text.split(',')
    return [item.strip().lower() for item in items if item.strip()]

# --- Core Model Building ---

def build_model():
    """
    Loads data, engineers features, and builds the KNN model.
    This function is called only once to initialize the recommender.
    """
    global _df, _nn_model, _title_to_index, _combined_features

    # 1. Load and Clean Data
    try:
        df = pd.read_csv(DATA_PATH)
        # Standardize column names like in the notebook
        rename_map = {
            "name": ["title", "question", "name"],
            "difficulty": ["difficulty", "level"],
            "company": ["company", "companies"],
            "topic": ["topic", "tag", "tags", "related_topics"],
        }
        current_cols = {c.lower().strip().replace('_', ' '): c for c in df.columns}
        final_rename = {}
        for standard_name, potential_names in rename_map.items():
            for potential_name in potential_names:
                if potential_name in current_cols:
                    final_rename[current_cols[potential_name]] = standard_name
                    break
        if final_rename:
            df = df.rename(columns=final_rename)

    except FileNotFoundError:
        print(f"ERROR: Dataset not found at {DATA_PATH}")
        _df = pd.DataFrame(
            columns=[
                'id', 'name', 'difficulty', 'company', 'topic',
                'acceptance_rate', 'frequency', 'rating'
            ]
        )
        return

    # --- FutureWarning FIXES ---
    # Use assignment instead of inplace for better future compatibility
    df['company'] = df['company'].fillna('')
    df['related_topics'] = df['related_topics'].fillna('')

    # 2. Feature Engineering
    df['topic_list'] = df['related_topics'].apply(clean_and_split)
    df['company_list'] = df['company'].apply(clean_and_split)

    # print(df[['name', 'topic_list']])  # Use logging if needed

    # --- Create ML Features ---
    # Difficulty to Numeric
    difficulty_mapping = {'Easy': 0, 'Medium': 1, 'Hard': 2}
    df['difficulty_numeric'] = df['difficulty'].map(difficulty_mapping).fillna(0)

    # Topics to TF-IDF Vectors
    df['topic_clean_str'] = df['topic_list'].apply(lambda x: ' '.join(x))
    tfidf = TfidfVectorizer(min_df=2)
    topic_vectors = tfidf.fit_transform(df['topic_clean_str'])

    # Scale Numerical Features
    scaler = MinMaxScaler()
    numerical_features = df[
        ['acceptance_rate', 'frequency', 'rating', 'difficulty_numeric']
    ].astype(float).fillna(0)
    scaled_numerical_features = scaler.fit_transform(numerical_features)

    # 3. Combine features and Build KNN Model
    _combined_features = hstack([topic_vectors, scaled_numerical_features]).tocsr()
    _nn_model = NearestNeighbors(n_neighbors=10, algorithm='brute', metric='cosine')
    _nn_model.fit(_combined_features)

    # Store necessary components globally
    _df = df
    _title_to_index = pd.Series(_df.index, index=_df['name'])
    # print("✅ Recommendation model built successfully.")  # Use logging if needed

def _get_recommendations(start_question_title: str, k: int = 10) -> pd.DataFrame:
    """Internal function to get k-nearest neighbors for a given question title."""
    try:
        idx = _title_to_index[start_question_title]
    except KeyError:
        return pd.DataFrame()  # Return empty DataFrame if title not found

    query_vector = _combined_features[idx]
    distances, indices = _nn_model.kneighbors(query_vector, n_neighbors=k+1)
    # Get indices of similar items, excluding the item itself (which is always the first)
    similar_indices = indices.flatten()[1:]
    return _df.iloc[similar_indices]

# --- API-Facing Functions ---

def get_initial_questions(company: Optional[str] = None, topic: Optional[str] = None) -> List[dict]:
    """
    Gets initial 'easy' questions based on optional company or topic filters.
    The underlying logic is rule-based for starting a session.
    """
    if _df is None:
        build_model()

    q = _df.copy()
    if company:
        q = q[q['company_list'].apply(lambda lst: company.lower() in lst)]
    if topic:
        q = q[q['topic_list'].apply(lambda lst: topic.lower() in lst)]

    # Filter for easy questions to start
    easy_questions = q[q['difficulty'] == 'Easy']

    if len(easy_questions) == 0:
        return []

    # Return up to two questions
    return easy_questions.sample(min(len(easy_questions), 2)).fillna("").to_dict(orient="records")

def next_question(prev_row: dict, result: str, duration_minutes: float) -> Optional[dict]:
    """
    Recommends the next question using the KNN model, adapting to user performance.
    """
    if _nn_model is None:
        build_model()

    prev_title = prev_row.get("name")
    if not prev_title:
        return None

    # Get the 10 most similar questions from our KNN model
    recs = _get_recommendations(prev_title)
    if recs.empty:
        return None

    # Adaptive logic based on performance
    if result.lower() == "accepted" and duration_minutes < 20:
        # User did well, find a similar but harder question
        next_q = recs[recs['difficulty'].isin(['Medium', 'Hard'])].head(1)
    else:
        # User struggled or took long, find another similar easy question
        next_q = recs[recs['difficulty'] == 'Easy'].head(1)
    # If our specific filter found a question, return it
    if not next_q.empty:
        return next_q.iloc[0].to_dict()
    # Fallback: if no harder/easier question was found, just return the most similar one
    elif not recs.empty:
        return recs.iloc[0].to_dict()
    else:
        return None
