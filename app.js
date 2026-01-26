const equationInput = document.getElementById('equation-input');
const equationOutput = document.getElementById('equation-output');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const symbolBtns = document.querySelectorAll('.symbol-btn');
const toolBtns = document.querySelectorAll('.tool-btn');
const floatingSymbols = document.querySelectorAll('.symbol-key');
const exportBtn = document.getElementById('export-btn');
const exportImageBtn = document.getElementById('export-image-btn');

// Add theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');

// Check for saved theme preference or use light mode as default
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.classList.toggle('dark-mode', savedTheme === 'dark');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

function renderEquation() {
    const latex = equationInput.value.trim();
    if (latex) {
        equationOutput.innerHTML = `
            <div style="position: relative; display: inline-block;">
                $$${latex}$$
                <button class="copy-equation-btn" onclick="copyRenderedEquation()">Copy Equation</button>
            </div>
        `;
        MathJax.typesetPromise([equationOutput]);
    } else {
        equationOutput.innerHTML = '<p class="placeholder">Your equation will appear here...</p>';
    }
}

// Add copy function to global scope
window.copyRenderedEquation = async function() {
    try {
        const equationElement = equationOutput.querySelector('mjx-container') || equationOutput.querySelector('div');
        
        // Create a canvas to convert MathML to image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Create a temporary div to hold the equation
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = equationOutput.innerHTML;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.background = document.body.classList.contains('dark-mode') ? '#2a2a3a' : 'white';
        tempDiv.style.color = document.body.classList.contains('dark-mode') ? 'white' : 'black';
        tempDiv.style.padding = '20px';
        document.body.appendChild(tempDiv);
        
        // Use html2canvas or similar, but since we don't have it, we'll copy as text
        // For now, copy the LaTeX source and MathML
        const latex = equationInput.value.trim();
        const mathml = equationOutput.querySelector('mjx-container')?.outerHTML || latex;
        
        // Create a comprehensive text format
        const copyText = `LaTeX: ${latex}\nMathML: ${mathml}`;
        
        await navigator.clipboard.writeText(copyText);
        
        // Show feedback
        const btn = equationOutput.querySelector('.copy-equation-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
        
        // Clean up
        document.body.removeChild(tempDiv);
        
    } catch (err) {
        console.error('Failed to copy: ', err);
        
        // Fallback to copying LaTeX source
        const latex = equationInput.value.trim();
        if (latex) {
            navigator.clipboard.writeText(latex).then(() => {
                alert('Equation copied as LaTeX: ' + latex);
            });
        }
    }
};

function insertSymbol(latex) {
    const start = equationInput.selectionStart;
    const end = equationInput.selectionEnd;
    const current = equationInput.value;
    
    equationInput.value = current.substring(0, start) + latex + current.substring(end);
    equationInput.focus();
    equationInput.setSelectionRange(start + latex.length, start + latex.length);
    
    // Render immediately after inserting symbol
    renderEquation();
}

function copyLatex() {
    const latex = equationInput.value.trim();
    if (latex) {
        navigator.clipboard.writeText(latex).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy LaTeX';
            }, 2000);
        });
    }
}

function clearAll() {
    equationInput.value = '';
    renderEquation();
}

function exportToWord() {
    const latex = equationInput.value.trim();
    if (!latex) {
        alert('Please enter an equation first');
        return;
    }

    // Create MathML from LaTeX using MathJax
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `$$${latex}$$`;
    MathJax.typesetPromise([tempDiv]).then(() => {
        const mathml = tempDiv.querySelector('mjx-container')?.innerHTML || latex;

        // Create Word document
        const html = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office'
                  xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head>
                <meta charset="utf-8">
                <title>LaTeX Equation</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .equation { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
                </style>
            </head>
            <body>
                <h2>LaTeX Equation Export</h2>
                <div class="equation">
                    ${mathml}
                </div>
                <p><strong>LaTeX Source:</strong> <code>${latex}</code></p>
            </body>
            </html>
        `;

        // Create and download file
        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'equation.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

copyBtn.addEventListener('click', copyLatex);
clearBtn.addEventListener('click', clearAll);
exportBtn.addEventListener('click', exportToWord);

symbolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        insertSymbol(btn.dataset.latex);
    });
});

toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        let latex = '';
        switch(cmd) {
            case 'frac':
                latex = '\\frac{ }{ }';
                break;
            case 'sqrt':
                latex = '\\sqrt{ }';
                break;
            case 'sub':
                latex = '_{ }';
                break;
            case 'sup':
                latex = '^{ }';
                break;
            case 'sum':
                latex = '\\sum_{ }^{ }';
                break;
            case 'int':
                latex = '\\int_{ }^{ }';
                break;
            case 'lim':
                latex = '\\lim_{ }';
                break;
            case 'alpha':
                latex = '\\alpha';
                break;
            case 'beta':
                latex = '\\beta';
                break;
            case 'gamma':
                latex = '\\gamma';
                break;
            case 'delta':
                latex = '\\Delta';
                break;
            case 'pm':
                latex = '\\pm';
                break;
            case 'neq':
                latex = '\\neq';
                break;
            case 'leq':
                latex = '\\leq';
                break;
            case 'geq':
                latex = '\\geq';
                break;
            case 'times':
                latex = '\\times';
                break;
            case 'div':
                latex = '\\div';
                break;
            case 'infty':
                latex = '\\infty';
                break;
            case 'partial':
                latex = '\\partial';
                break;
            case 'nabla':
                latex = '\\nabla';
                break;
            case 'pmatrix':
                latex = '\\begin{pmatrix} & \\\\ & \\end{pmatrix}';
                break;
            case 'cdot':
                latex = '\\cdot';
                break;
        }
        insertSymbol(latex);
    });
});

floatingSymbols.forEach(btn => {
    btn.addEventListener('click', () => {
        insertSymbol(btn.dataset.symbol);
    });
});

equationInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        renderEquation();
    }
});

// Add floating effect when scrolling
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const inputSection = document.querySelector('.input-section');
    const actions = document.querySelector('.actions');
    
    if (window.scrollY > 100) {
        inputSection.style.transform = 'translateY(0)';
        inputSection.style.boxShadow = '0 15px 40px rgba(0,0,0,0.2)';
    } else {
        inputSection.style.transform = 'translateY(0)';
        inputSection.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    }
});

// Real-time rendering on every keystroke with debounce
let renderTimeout;
equationInput.addEventListener('input', () => {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
        renderEquation();
    }, 150); // Faster update for real-time feel
});

// Initial render
renderEquation();

exportImageBtn.addEventListener('click', exportAsImage);

function exportAsImage() {
    const latex = equationInput.value.trim();
    if (!latex) {
        alert('Please enter an equation first');
        return;
    }

    // Create temporary container for rendering
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.background = document.body.classList.contains('dark-mode') ? '#2a2a3a' : 'white';
    tempDiv.style.color = document.body.classList.contains('dark-mode') ? 'white' : 'black';
    tempDiv.style.padding = '40px';
    tempDiv.style.fontSize = '24px';
    tempDiv.style.display = 'inline-block';
    document.body.appendChild(tempDiv);

    // Render equation
    tempDiv.innerHTML = `$$${latex}$$`;
    
    MathJax.typesetPromise([tempDiv]).then(() => {
        // Create canvas to convert to image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Get the dimensions of the equation
        const equationElement = tempDiv.querySelector('mjx-container') || tempDiv;
        const rect = equationElement.getBoundingClientRect();
        
        // Set canvas dimensions with padding
        const padding = 40;
        canvas.width = rect.width + padding * 2;
        canvas.height = rect.height + padding * 2;
        
        // Fill background
        ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#2a2a3a' : 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Convert to SVG and then to canvas
        const data = new XMLSerializer().serializeToString(equationElement);
        const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, padding, padding);
            
            // Convert canvas to PNG and download
            canvas.toBlob(blob => {
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `equation-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Cleanup
                URL.revokeObjectURL(downloadUrl);
                URL.revokeObjectURL(url);
                document.body.removeChild(tempDiv);
            });
        };
        img.src = url;
    }).catch(err => {
        console.error('Error exporting image:', err);
        alert('Error exporting equation as image. Please try again.');
        document.body.removeChild(tempDiv);
    });
}