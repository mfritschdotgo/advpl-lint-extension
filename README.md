# ADVPL Linter - Análise Estática de Código

Esta extensão fornece análise estática para códigos **ADVPL**, **TLPP** e **PRG**. Clique [aqui](https://github.com/mfritschdotgo/advpl-lint-extension) para acessar o código dessa extensão.

Ela utiliza um motor de análise escrito em **Go** com base em **ANTLR**, clique [aqui](https://github.com/mfritschdotgo/advpl-lint) para acessar o código deste motor de análise. 

## Funcionalidades
___
Atualmente temos as funcionalidades abaixo, mas é uma ferramenta em construção e deve continuar a receber novas funcionalidades.

- **Detecção de Objetos não liberados:** Identifica variáveis instanciadas (ex: `oObj := MsNew...`) que não foram limpas com `FreeObj()`.
- **Detecção de Arrays não liberados:** Monitora arrays complexos que deveriam ser limpos com `FWFreeArray()` ou `aSize(a,0)`.
- **Suporte a Múltiplos Arquivos:** Compatível com `.prw`, `.tlpp` e `.prg`.
- **Integração Nativa:**
  - Erros sublinhados em vermelho no editor.
  - Lista completa na aba "Problems" (Problemas) do VS Code.
  - Status na barra inferior indicando o progresso da análise.

## Como Usar
___
A análise é executada **sob demanda** para economizar recursos da sua máquina.

1. Abra um arquivo fonte (`.prw`, `.tlpp` ou `.prg`) no VS Code.
2. Abra a Paleta de Comandos (`Ctrl+Shift+P` ou `F1`).
3. Digite **"ADVPL"** e selecione a opção:
   > **ADVPL Lint: Analisar Arquivo Atual**

Aguarde alguns segundos. Se houver problemas, eles serão destacados no código.

## Configurações da Extensão
___
Esta extensão funciona "out-of-the-box" (sem configuração), pois já traz os binários de análise embutidos. No entanto, você pode customizar se necessário:

* `advplLint.binaryPath`: (Opcional) Caminho absoluto para um executável do linter customizado, caso você não queira usar a versão que vem com a extensão.

## Requisitos
___
* **VS Code** versão 1.80.0 ou superior.
* Nenhum software adicional é necessário (o motor em Go já está incluso no pacote).


## Guia de Desenvolvimento (Para Contribuidores)
___
Se você deseja alterar o código fonte desta extensão ou recompilar o motor de análise, siga os passos abaixo.

### 1. Estrutura do Projeto

* `/src`: Código fonte da extensão em **TypeScript**.
* `/bin`: Onde ficam os executáveis compilados (`.exe` e binário Linux).

### 2. Compilando o Motor (Go)

Antes de empacotar a extensão, é necessário gerar os binários para Windows e Linux. Execute na raiz do projeto:

**Para Windows:**
```bash
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o bin/advpl-lint.exe main.go
```
**Para Linux:**
```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/advpl-lint-linux main.go
```
### 3. Compilando a Extensão (TypeScript)
Instale as dependências e compile o código:

```bash
npm install
npm run compile
```
**Empacotando (.vsix)**
```bash
npx @vscode/vsce package
```
### 4. Licença
Este projeto está licenciado sob a MIT License.

