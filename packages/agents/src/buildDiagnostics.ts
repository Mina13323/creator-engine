import { GeneratedFile } from './builderAgent';

export interface BuildDiagnostic {
  type: 'MISSING_PACKAGE' | 'MISSING_IMPORT' | 'SERVER_CLIENT_ERROR' | 'SHADCN_MISSING' | 'TYPESCRIPT' | 'UNKNOWN';
  file?: string;
  message: string;
  fixStrategy: string;
  meta?: any;
}

export function analyzeBuildError(errorText: string): BuildDiagnostic {
  if (errorText.includes('useState only works in Client Components') || errorText.includes('useEffect only works in Client Components') || errorText.includes('framer-motion')) {
    const fileMatch = errorText.match(/(?:\.\/)?(app\/[^:\s]+|components\/[^:\s]+|lib\/[^:\s]+)/);
    return {
      type: 'SERVER_CLIENT_ERROR',
      file: fileMatch ? fileMatch[1] : undefined,
      message: 'Client hook used in Server Component',
      fixStrategy: 'ADD_USE_CLIENT'
    };
  }

  const missingPackageMatch = errorText.match(/Cannot find module '([^']+)'/);
  if (missingPackageMatch) {
    return {
      type: 'MISSING_PACKAGE',
      message: `Missing package: ${missingPackageMatch[1]}`,
      fixStrategy: 'INSTALL_PACKAGE',
      meta: { pkg: missingPackageMatch[1] }
    };
  }

  const shadcnMatch = errorText.match(/Module not found: Can't resolve '(?:@\/)?components\/ui\/([^']+)'/);
  if (shadcnMatch) {
    const fileMatch = errorText.match(/(?:\.\/)?(app\/[^:\s]+|components\/[^:\s]+|lib\/[^:\s]+)/);
    return {
      type: 'SHADCN_MISSING',
      file: fileMatch ? fileMatch[1] : undefined,
      message: `Missing shadcn component: ${shadcnMatch[1]}`,
      fixStrategy: 'CREATE_SHADCN_STUB',
      meta: { component: shadcnMatch[1] }
    };
  }

  const fileMatch = errorText.match(/(?:\.\/)?(app\/[^:\s]+|components\/[^:\s]+|lib\/[^:\s]+)/);
  return {
    type: 'UNKNOWN',
    file: fileMatch ? fileMatch[1] : undefined,
    message: errorText.slice(0, 500),
    fixStrategy: 'AI_REPAIR'
  };
}

export function applyAutoFix(diagnostic: BuildDiagnostic, files: GeneratedFile[]): { patched: boolean; newFiles?: GeneratedFile[]; pkgToInstall?: string } {
  if (diagnostic.type === 'SERVER_CLIENT_ERROR' && diagnostic.file) {
    const file = files.find(f => f.path === diagnostic.file);
    if (file && !file.content.includes('"use client"') && !file.content.includes("'use client'")) {
      file.content = '"use client";\n' + file.content;
      return { patched: true };
    }
  }

  if (diagnostic.type === 'MISSING_PACKAGE' && diagnostic.meta?.pkg) {
    const allowed = ['framer-motion', 'lucide-react', 'clsx', 'tailwind-merge', 'class-variance-authority'];
    if (allowed.includes(diagnostic.meta.pkg)) {
      return { patched: true, pkgToInstall: diagnostic.meta.pkg };
    }
  }

  if (diagnostic.type === 'SHADCN_MISSING' && diagnostic.meta?.component) {
    const compName = diagnostic.meta.component.toLowerCase().replace('.tsx', '').replace('.js', '');
    const path = `components/ui/${compName}.tsx`;
    const exists = files.find(f => f.path === path);
    
    if (!exists) {
      let content = `export const ${compName.charAt(0).toUpperCase() + compName.slice(1)} = ({ children, ...props }: any) => <div {...props}>{children}</div>;`;
      if (compName === 'button') {
        content = `export const Button = ({ children, ...props }: any) => <button className="px-4 py-2 bg-black text-white rounded" {...props}>{children}</button>;`;
      } else if (compName === 'input') {
        content = `export const Input = (props: any) => <input className="border p-2 rounded" {...props} />;`;
      } else if (compName === 'card') {
        content = `export const Card = ({ children, ...props }: any) => <div className="border rounded p-4 shadow" {...props}>{children}</div>;\nexport const CardContent = ({ children, ...props }: any) => <div {...props}>{children}</div>;\nexport const CardHeader = ({ children, ...props }: any) => <div className="mb-2" {...props}>{children}</div>;\nexport const CardTitle = ({ children, ...props }: any) => <h2 className="text-xl font-bold" {...props}>{children}</h2>;`;
      } else if (compName === 'badge') {
        content = `export const Badge = ({ children, ...props }: any) => <span className="bg-gray-200 text-sm px-2 py-1 rounded" {...props}>{children}</span>;`;
      }
      
      return { 
        patched: true, 
        newFiles: [{ path, content, language: 'typescript' }]
      };
    }
  }

  return { patched: false };
}
