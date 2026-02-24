export interface Feature {
  command: string;
  description: string;
  category: string;
}

export const features: Feature[] = [
  // Security Commands
  { command: '/cve', description: 'Get details of a specific CVE: severity, summary, and affected systems', category: 'security' },
  { command: '/exploitdb', description: 'Search ExploitDB for public exploits and PoCs', category: 'security' },
  { command: '/ioc', description: 'Fetch Indicators of Compromise for malware, tools, or APTs', category: 'security' },
  { command: '/pentest', description: 'Provides methodology and tools for penetration testing', category: 'security' },
  { command: '/privsec', description: 'Lists privilege escalation techniques for a given OS', category: 'security' },
  { command: '/ir', description: 'Incident Response playbook for handling specific threats', category: 'security' },
  { command: '/dfir', description: 'Digital Forensics & IR steps for breach investigations', category: 'security' },
  { command: '/soctools', description: 'Lists essential SOC tools for monitoring and defense', category: 'security' },
];

// Helper function to filter features based on search term
export const filterFeatures = (searchTerm: string): Feature[] => {
  if (!searchTerm) return [];
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  return features.filter(feature => 
    feature.command.toLowerCase().includes(lowerCaseSearchTerm) || 
    feature.description.toLowerCase().includes(lowerCaseSearchTerm)
  );
};
