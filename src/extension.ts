import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Mapeamento de severidade do Go para o VS Code
const severityMap: { [key: string]: vscode.DiagnosticSeverity } = {
    'ERROR': vscode.DiagnosticSeverity.Error,
    'WARNING': vscode.DiagnosticSeverity.Warning,
    'INFO': vscode.DiagnosticSeverity.Information
};

// Variável global para armazenar os sublinhados vermelhos
let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {

    diagnosticCollection = vscode.languages.createDiagnosticCollection('advpl-lint');
    context.subscriptions.push(diagnosticCollection);

    let disposable = vscode.commands.registerCommand('advpl-lint.analisarArquivo', () => {
        
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            diagnosticCollection.clear();
            
            vscode.window.setStatusBarMessage('$(sync~spin) Analisando arquivo...', 3000);
            
            runLinter(editor.document);
        } else {
            vscode.window.showInformationMessage('Abra um arquivo Advpl/Tlpp para analisar.');
        }
    });

    context.subscriptions.push(disposable);
}

function runLinter(document: vscode.TextDocument) {
    const ext = path.extname(document.fileName).toLowerCase();
    if (!['.prw', '.tlpp', '.prg'].includes(ext)) {
        vscode.window.showWarningMessage(`Extensão '${ext}' não suportada pelo Linter.`);
        return;
    }

    const isWindows = process.platform === 'win32';
    const binaryName = isWindows ? 'advpl-lint-windows.exe' : 'advpl-lint-linux';

    const extensionRoot = path.join(__dirname, '..'); 
    let linterPath = path.join(extensionRoot, 'bin', binaryName);

    if (!fs.existsSync(linterPath)) {
        vscode.window.showErrorMessage(`Executável do linter não encontrado. Esperado em: ${linterPath}`);
        return;
    }

    if (!isWindows) {
        try {
            fs.chmodSync(linterPath, '755');
        } catch (err) {
            console.warn('Aviso: Não foi possível definir permissão +x no binário:', err);
        }
    }

    const args = ['-file', document.fileName, '-format', 'json'];
    const cwd = path.dirname(document.fileName);

    cp.execFile(linterPath, args, { cwd }, (error, stdout, stderr) => {
        if (stderr) {
            console.warn('Linter Stderr:', stderr);
        }

        if (stdout) {
            try {
                const issues = JSON.parse(stdout);
                
                const diagnostics: vscode.Diagnostic[] = issues.map((issue: any) => {
                    const lineIndex = issue.Line > 0 ? issue.Line - 1 : 0;
                    
                    const range = new vscode.Range(lineIndex, 0, lineIndex, Number.MAX_VALUE);
                    
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        issue.Message,
                        severityMap[issue.Severity] || vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.source = 'advpl-lint';
                    diagnostic.code = 'L002'; 
                    return diagnostic;
                });

                diagnosticCollection.set(document.uri, diagnostics);

                if (issues.length === 0) {
                    vscode.window.setStatusBarMessage('$(check) ADVPL Lint: Código limpo!', 4000);
                } else {
                    vscode.window.setStatusBarMessage(`$(alert) ADVPL Lint: ${issues.length} problemas encontrados.`, 5000);
                    vscode.commands.executeCommand('workbench.action.problems.focus'); 
                }

            } catch (e) {
                console.error('Erro ao ler JSON gerado pelo linter:', e);
                console.log('Conteúdo recebido:', stdout);
                vscode.window.showErrorMessage('Erro ao processar o resultado da análise.');
            }
        } else {
            if (error && error.code !== 1) { // code 1 é normal quando acha bugs
                 console.error('Erro fatal na execução:', error);
                 vscode.window.showErrorMessage('Falha ao executar o linter.');
            }
        }
    });
}

export function deactivate() {}