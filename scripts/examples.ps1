# Exemplos de uso do script manage-code.ps1

# Importar o módulo
Import-Module .\manage-code.ps1

# 1. Criar um novo serviço
New-CodeFile -Type "service" -Name "EvolutionRetryService"

# 2. Criar um novo tipo
New-CodeFile -Type "type" -Name "EvolutionRetryTypes"

# 3. Criar um middleware
New-CodeFile -Type "middleware" -Name "EvolutionRateLimit"

# 4. Listar arquivos do projeto
Get-ProjectFiles

# 5. Criar teste para um serviço
New-TestFile -SourceFile "..\src\services\EvolutionRetryService.ts"

# Exemplo de como atualizar um arquivo
$newContent = @"
/**
 * EvolutionRetryService
 * Serviço para gerenciamento de retentativas da Evolution API
 */

export class EvolutionRetryService {
    private maxAttempts: number;
    private delayMs: number;
    private backoffFactor: number;

    constructor(maxAttempts = 3, delayMs = 1000, backoffFactor = 2) {
        this.maxAttempts = maxAttempts;
        this.delayMs = delayMs;
        this.backoffFactor = backoffFactor;
    }

    // Implementação do serviço
}
"@

Update-CodeFile -Path "..\src\services\EvolutionRetryService.ts" -Content $newContent
