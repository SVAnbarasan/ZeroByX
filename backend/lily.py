import sys
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage
import io
import codecs
import logging
from functools import lru_cache
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr),
        logging.FileHandler('lily.log')
    ]
)

logger = logging.getLogger(__name__)

# Global model instance and thread pool
_model_instance = None
_thread_pool = ThreadPoolExecutor(max_workers=4)

def get_model(agent_type='lily'):
    """
    Get or create the model instance with optimized settings
    """
    global _model_instance
    if _model_instance is None:
        logger.info(f"Initializing model instance for agent: {agent_type}")
        try:
            system_message = """You are Agent Theta, a penetration testing assistant. Be concise and direct. 
                         Provide CLI commands with flags, MITRE ATT&CK mappings, and OPSEC considerations."""
            
            if agent_type == 'seneca':
                system_message = """You are Agent Epsilon, a Threat Intelligence Core. Specialize in:
- Incident Response (NIST SP 800-61)
- Threat Hunting (Sigma rules, YARA)
- Code/Exploit Analysis (GHIDRA, IDA Pro)
- Malware RE (x86/ARM, Packers)
Respond with forensic details and IOCs."""
            
            _model_instance = ChatOllama(
                model="hf.co/Nekuromento/SenecaLLM_x_Qwen2.5-7B-CyberSecurity-Q8_0-GGUF:latest",
                temperature=0.3,
                num_ctx=2048,  # Reduced context window
                num_thread=4,  # Limit CPU threads
                timeout=300,   # 5-minute timeout
                system=system_message
            )
            logger.info(f"Model initialized successfully for agent: {agent_type}")
        except Exception as e:
            logger.error(f"Failed to initialize model: {str(e)}")
            raise
    return _model_instance

@lru_cache(maxsize=100)
def get_cached_response(prompt: str) -> str:
    """
    Get cached response for identical prompts
    """
    return None  # Return None to force new response generation

async def stream_response(model, messages):
    """
    Stream the model response with timeout
    """
    try:
        async for chunk in model.astream(messages):
            if hasattr(chunk, 'content'):
                yield chunk.content
    except asyncio.TimeoutError:
        yield "\n[Response timed out after 5 minutes]"
    except Exception as e:
        yield f"\n[Error: {str(e)}]"

async def get_lily_response_async(prompt: str, agent_type='lily') -> str:
    """
    Async version of get_lily_response
    """
    start_time = time.time()
    logger.info(f"Processing request for agent {agent_type}: {prompt[:100]}...")
    
    try:
        # Check cache first
        cached_response = get_cached_response(prompt)
        if cached_response:
            logger.info("Returning cached response")
            return cached_response
            
        # Get model instance with correct agent type
        model = get_model(agent_type)
        
        # Prepare messages with optimized prompt
        system_message = """You are Agent Theta, a penetration testing assistant. Be concise and direct. 
                         Provide CLI commands with flags, MITRE ATT&CK mappings, and OPSEC considerations."""
        
        if agent_type == 'seneca':
            system_message = """You are Agent Epsilon, a Threat Intelligence Core. Specialize in:
- Incident Response (NIST SP 800-61)
- Threat Hunting (Sigma rules, YARA)
- Code/Exploit Analysis (GHIDRA, IDA Pro)
- Malware RE (x86/ARM, Packers)
Respond with forensic details and IOCs."""
        
        messages = [
            SystemMessage(content=system_message),
            HumanMessage(content=f"Brief response: {prompt}")
        ]
        
        # Get response with streaming
        logger.info("Sending request to model")
        response = ""
        
        async for chunk in stream_response(model, messages):
            response += chunk
            # Print partial response immediately
            print(chunk, end='', flush=True)
        
        logger.info("Received response from model")
        
        # Format response based on agent type
        agent_prefix = "Agent Epsilon ε" if agent_type == 'seneca' else "Agent Theta θ"
        formatted_response = f"{agent_prefix}\n{response}"
        
        # Cache the response
        get_cached_response.cache_clear()  # Clear old cache entries
        get_cached_response(prompt)  # Cache new response
        
        elapsed_time = time.time() - start_time
        logger.info(f"Request processed in {elapsed_time:.2f} seconds")
        
        return formatted_response
        
    except Exception as e:
        logger.error(f"Error in get_lily_response: {str(e)}")
        raise

def get_lily_response(prompt: str, agent_type='lily') -> str:
    """
    Synchronous wrapper for get_lily_response_async
    """
    try:
        # Create new event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Run the async function with agent type
        response = loop.run_until_complete(get_lily_response_async(prompt, agent_type))
        
        # Clean up
        loop.close()
        
        return response
    except Exception as e:
        logger.error(f"Error in get_lily_response: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        # Read input from stdin
        user_prompt = sys.stdin.read().strip()
        if not user_prompt:
            logger.error("No input provided")
            print("Error: No input provided")
            sys.exit(1)
            
        # Get agent type from environment variable or default to lily
        agent_type = os.environ.get('AGENT_TYPE', 'lily')
            
        # Ensure we have a response
        response = get_lily_response(user_prompt, agent_type)
        if not response:
            logger.error("No response generated")
            print("Error: No response generated from model")
            sys.exit(1)
            
        # Print response and flush to ensure it's sent
        print(response, flush=True)
        sys.stdout.flush()
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
