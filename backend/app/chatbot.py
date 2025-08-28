from .config import settings
import google.generativeai as genai

# Configure the Gemini API key
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

async def get_gemini_response(prompt: str, question_context: str = "") -> str:
    """
    Gets a response from the Gemini API based on a prompt and optional question context.
    """
    if not settings.GEMINI_API_KEY:
        return "The chatbot is not configured. Please set the GEMINI_API_KEY."

    try:
        # ✅ FIXED: Updated the model name to a current, valid model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        full_prompt = f"""
        You are a friendly and encouraging AI tutor for a Data Structures and Algorithms practice platform.
        A user is working on the following problem: "{question_context}"

        The user's request is: "{prompt}"

        Please respond in a helpful and supportive manner. 
        - If they ask for a hint, provide a small one.
        - If they ask for the solution, provide it with a clear explanation.
        - If they are just chatting, be encouraging.
        """
        
        response = await model.generate_content_async(full_prompt)
        return response.text
        
    except Exception as e:
        print(f"Error communicating with Gemini API: {e}")
        return "Sorry, I'm having trouble connecting to my brain right now. Please try again later."
