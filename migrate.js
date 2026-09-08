const fs = require('fs');

['Home', 'Login', 'StudyModule'].forEach(name => {
  let p = `src/pages/${name}.tsx`;
  if (!fs.existsSync(p)) return;
  
  let c = fs.readFileSync(p, 'utf8');
  c = '"use client";\n\n' + c;
  
  // Replace Wouter usage
  c = c.replace(/import\s+\{.*?(useLocation|useRoute).*?\}\s+from\s+"wouter";/g, 'import { useRouter } from "next/navigation";');
  c = c.replace(/const\s+\[\s*,\s*setLocation\s*\]\s*=\s*useLocation\(\);/g, 'const router = useRouter();');
  c = c.replace(/setLocation\((.*?)\);/g, 'router.push($1);');
  
  let dest = name === 'Home' ? 'src/app/page.tsx' : (name === 'Login' ? 'src/app/login/page.tsx' : 'src/app/module/page.tsx');
  let destDir = dest.replace('/page.tsx', '');
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  fs.writeFileSync(dest, c);
});

if (fs.existsSync('src/pages')) {
  fs.rmSync('src/pages', { recursive: true, force: true });
}
