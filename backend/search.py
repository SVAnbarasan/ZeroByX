import requests
import os
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage
import logging
import json
import traceback
import sys

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),  # Ensure logs go to stdout
        logging.FileHandler('search.log', mode='a')  # Append mode
    ]
)

# Create logger instance
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Get SerpAPI key from environment variable or use default
SERPAPI_KEY = os.getenv('SERPAPI_KEY', "777843a175fe6fa504d153fec9ad22ad861fde4b7c534f9bebfc7c28fc20087b")

def fetch_search_results(query):
    print("=== Starting fetch_search_results ===")  # Direct print for immediate visibility
    try:
        print(f"Query: {query}")
        print(f"Using SerpAPI key: {SERPAPI_KEY[:5]}...")  # Only show first 5 chars for security
        
        if not SERPAPI_KEY or len(SERPAPI_KEY) < 10:
            print(f"Invalid SerpAPI key: {SERPAPI_KEY}")
            return []

        search_url = "https://serpapi.com/search"
        params = {
            "engine": "google",
            "q": query,
            "api_key": SERPAPI_KEY,
            "num": 5,
            "gl": "us",
            "hl": "en"
        }

        print(f"Making request to SerpAPI with params: {params}")
        try:
            response = requests.get(search_url, params=params, timeout=10)
            print(f"Received response with status code: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"Parsed JSON response: {json.dumps(data, indent=2)}")
                    
                    if "error" in data:
                        print(f"SerpAPI error: {data['error']}")
                        return []
                    
                    results = data.get("organic_results", [])
                    print(f"Found {len(results)} organic results")
                    
                    if not results:
                        print("No organic results found in response")
                        results = data.get("answer_box", []) or data.get("knowledge_graph", [])
                        print(f"Found {len(results)} alternative results")
                        if not results:
                            return []
                    
                    return results[:5]
                    
                except json.JSONDecodeError as e:
                    print(f"Failed to parse JSON response: {str(e)}")
                    print(f"Raw response: {response.text}")
                    return []
                
            else:
                print(f"SerpAPI request failed with status code: {response.status_code}")
                print(f"Response headers: {response.headers}")
                print(f"Response text: {response.text}")
                return []
                
        except requests.exceptions.RequestException as e:
            print(f"Network error while fetching search results: {str(e)}")
            return []
            
    except Exception as e:
        print(f"Unexpected error in fetch_search_results: {str(e)}")
        print(traceback.format_exc())
        return []

def search_with_ai(query):
    print("=== Starting search_with_ai ===")  # Direct print for immediate visibility
    try:
        print(f"Query: {query}")
        
        if not query or len(query.strip()) < 2:
            print("Query too short or empty")
            return "Please provide a more detailed search query."
            
        search_results = fetch_search_results(query)
        print(f"Received {len(search_results)} search results")

        if not search_results:
            print("No search results found")
            return """I couldn't find any relevant information for your search. This could be due to:
1. The search query being too specific or complex
2. Network or API limitations
3. No available information on the topic

Please try:
- Simplifying your search terms
- Using different keywords
- Checking your internet connection
- Trying again in a few moments"""

        # Format results for AI processing
        formatted_results = "\n\n".join([
            f"Title: {r.get('title', 'No title')}\n"
            f"Snippet: {r.get('snippet', 'No description')}\n"
            f"Link: {r.get('link', 'No link')}"
            for r in search_results
        ])
        print("Formatted search results for AI processing")

        print("Initializing Ollama model")
        try:
            llm = ChatOllama(
                model="deepseek-r1:latest",
                temperature=0.7
            )
            print("Ollama model initialized successfully")

            messages = [
                SystemMessage(content="""You are an AI assistant that provides concise and insightful summaries based on real-time search results.
                Your response should:
                1. Start with a brief overview of what you found
                2. Highlight the most relevant information
                3. Include key insights or interesting findings
                4. End with a helpful suggestion or next step
                Format your response in clear paragraphs with proper spacing."""),
                HumanMessage(content=f"""User asked: {query}

Here are the search results:
{formatted_results}

Please provide a well-structured, engaging summary that helps the user understand the topic better.""")
            ]

            print("Generating AI response")
            response = llm.invoke(messages).content
            print("Successfully generated AI response")
            
            return response
        except Exception as e:
            print(f"Error with Ollama model: {str(e)}")
            print(traceback.format_exc())
            # Return formatted results directly if AI processing fails
            return f"""Here are the search results I found:

{formatted_results}

Please review these results and let me know if you'd like more information on any specific aspect."""

    except Exception as e:
        print(f"Error in search_with_ai: {str(e)}")
        print(traceback.format_exc())
        return """I encountered an error while processing your search. This could be due to:
1. Temporary service interruption
2. Network connectivity issues
3. High server load

Please try:
1. Checking your internet connection
2. Waiting a few moments and trying again
3. Using simpler search terms
4. Contacting support if the issue persists"""
