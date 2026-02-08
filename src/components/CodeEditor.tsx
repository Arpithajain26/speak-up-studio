import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Send, Copy, Check, RotateCcw } from 'lucide-react';

interface CodeEditorProps {
  onSubmitCode: (code: string, language: string) => void;
  isLoading: boolean;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
];

const TEMPLATES: Record<string, string> = {
  javascript: `// Write your solution here\nfunction solution(input) {\n  // Your code\n  \n  return result;\n}\n`,
  python: `# Write your solution here\ndef solution(input):\n    # Your code\n    \n    return result\n`,
  java: `// Write your solution here\nclass Solution {\n    public static void main(String[] args) {\n        // Your code\n    }\n}\n`,
  cpp: `// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code\n    \n    return 0;\n}\n`,
  typescript: `// Write your solution here\nfunction solution(input: any): any {\n  // Your code\n  \n  return result;\n}\n`,
  go: `// Write your solution here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Your code\n    fmt.Println("Hello")\n}\n`,
};

export const CodeEditor = ({ onSubmitCode, isLoading }: CodeEditorProps) => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(TEMPLATES.javascript);
  const [copied, setCopied] = useState(false);

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    setCode(TEMPLATES[lang] || '');
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleReset = useCallback(() => {
    setCode(TEMPLATES[language] || '');
  }, [language]);

  const handleSubmit = useCallback(() => {
    if (!code.trim()) return;
    onSubmitCode(code, language);
  }, [code, language, onSubmitCode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  }, [code]);

  return (
    <Card className="border-2 border-primary/20 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs font-mono text-muted-foreground ml-2">Code Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="h-7 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="text-xs">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} title="Copy code">
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset} title="Reset">
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative">
        <div className="flex">
          {/* Line Numbers */}
          <div className="bg-muted/30 px-3 py-3 text-right select-none border-r">
            {code.split('\n').map((_, i) => (
              <div key={i} className="text-xs font-mono text-muted-foreground/50 leading-6 h-6">
                {i + 1}
              </div>
            ))}
          </div>
          {/* Code Input */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-background font-mono text-sm p-3 resize-none focus:outline-none min-h-[250px] leading-6 text-foreground"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
      </div>

      {/* Submit Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-t">
        <p className="text-xs text-muted-foreground">
          Tab for indent • Write your solution and submit
        </p>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !code.trim()}
          size="sm"
          className="gradient-hero text-primary-foreground"
        >
          <Send className="w-3 h-3 mr-1" />
          Submit Code
        </Button>
      </div>
    </Card>
  );
};
