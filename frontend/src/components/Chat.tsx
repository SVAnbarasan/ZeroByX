import React, { useState, useRef, useEffect } from 'react';
import { Message, Model, models } from '../utils/api';
import { processMessage } from '../utils/api';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const Chat: React.FC = () => {
  // ... existing state and functions ...

  const formatResponse = (content: string) => {
    // Split content into lines
    const lines = content.split('\n');
    let formattedContent = '';
    let inCodeBlock = false;
    let currentCodeBlock = '';
    let codeBlockLanguage = '';

    for (let line of lines) {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          // Start of code block
          inCodeBlock = true;
          codeBlockLanguage = line.slice(3).trim() || 'plaintext';
          currentCodeBlock = '';
        } else {
          // End of code block
          inCodeBlock = false;
          formattedContent += `\`\`\`${codeBlockLanguage}\n${currentCodeBlock}\`\`\`\n\n`;
        }
        continue;
      }

      if (inCodeBlock) {
        currentCodeBlock += line + '\n';
        continue;
      }

      // Format lists and sections
      if (line.startsWith('- ')) {
        formattedContent += `- ${line.slice(2)}\n`;
      } else if (line.startsWith('## ')) {
        formattedContent += `\n## ${line.slice(3)}\n\n`;
      } else if (line.startsWith('### ')) {
        formattedContent += `\n### ${line.slice(4)}\n\n`;
      } else if (line.includes('|')) {
        // Handle tables
        formattedContent += `${line}\n`;
      } else if (line.trim() === '') {
        // Preserve empty lines
        formattedContent += '\n';
      } else {
        // Regular text
        formattedContent += `${line}\n`;
      }
    }

    return formattedContent;
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    const model = models.find(m => m.id === message.model);
    const modelName = model ? model.name : 'System';
    
    return (
      <div 
        key={message.id} 
        className={`p-6 rounded-lg mb-6 ${
          isUser ? 'bg-blue-50 ml-auto' : 'bg-white shadow-sm'
        }`}
      >
        <div className="flex items-center mb-4">
          {!isUser && (
            <span className="text-lg font-bold text-gray-800 mr-2">
              {modelName}:
            </span>
          )}
          <span className="text-sm text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="my-4">
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg shadow-sm"
                      customStyle={{
                        margin: '0.5rem 0',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef'
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              },
              p({node, children, ...props}) {
                return <p className="mb-4 leading-relaxed" {...props}>{children}</p>;
              },
              ul({node, children, ...props}) {
                return <ul className="list-disc pl-6 mb-4 space-y-2" {...props}>{children}</ul>;
              },
              ol({node, children, ...props}) {
                return <ol className="list-decimal pl-6 mb-4 space-y-2" {...props}>{children}</ol>;
              },
              li({node, children, ...props}) {
                return <li className="mb-1" {...props}>{children}</li>;
              },
              h1({node, children, ...props}) {
                return <h1 className="text-2xl font-bold mb-4 text-gray-800" {...props}>{children}</h1>;
              },
              h2({node, children, ...props}) {
                return <h2 className="text-xl font-bold mb-3 text-gray-800" {...props}>{children}</h2>;
              },
              h3({node, children, ...props}) {
                return <h3 className="text-lg font-bold mb-2 text-gray-800" {...props}>{children}</h3>;
              },
              strong({node, children, ...props}) {
                return <strong className="font-semibold text-gray-800" {...props}>{children}</strong>;
              },
              em({node, children, ...props}) {
                return <em className="italic text-gray-700" {...props}>{children}</em>;
              },
              table({node, ...props}) {
                return (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse" {...props} />
                  </div>
                );
              },
              th({node, ...props}) {
                return <th className="border px-4 py-2 bg-gray-50 text-left font-semibold" {...props} />;
              },
              td({node, ...props}) {
                return <td className="border px-4 py-2" {...props} />;
              },
              blockquote({node, children, ...props}) {
                return (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700" {...props}>
                    {children}
                  </blockquote>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/zbx_logo.png" 
              alt="ZeroByX Logo" 
              className="h-12 w-auto"
            />
            <h1 className="text-3xl font-bold text-gray-900">
              ZeroByX
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* ... existing header content ... */}
          </div>
        </div>
      </header>
      
      {/* ... rest of the component ... */}
    </div>
  );
};

export default Chat; 