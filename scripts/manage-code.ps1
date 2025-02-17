# Script para gerenciamento de código do projeto ADVSac
# Autor: Equipe ADVSac
# Data: 2025-02-10

# Configurações
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot
$BACKEND_DIR = Join-Path $PROJECT_ROOT "backend"
$SRC_DIR = Join-Path $BACKEND_DIR "src"
$TEMPLATES_DIR = Join-Path $PROJECT_ROOT "templates"

# Função para criar um novo arquivo
function New-CodeFile {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Type,
        
        [Parameter(Mandatory=$true)]
        [string]$Name,
        
        [Parameter(Mandatory=$false)]
        [string]$Directory
    )
    
    # Definir o diretório base baseado no tipo
    $baseDir = switch ($Type) {
        "service" { Join-Path $SRC_DIR "services" }
        "controller" { Join-Path $SRC_DIR "controllers" }
        "middleware" { Join-Path $SRC_DIR "middlewares" }
        "type" { Join-Path $SRC_DIR "types" }
        "config" { Join-Path $SRC_DIR "config" }
        "util" { Join-Path $SRC_DIR "utils" }
        default { $SRC_DIR }
    }
    
    # Se um diretório específico foi fornecido, use-o
    if ($Directory) {
        $baseDir = Join-Path $SRC_DIR $Directory
    }
    
    # Criar diretório se não existir
    if (-not (Test-Path $baseDir)) {
        New-Item -ItemType Directory -Path $baseDir -Force | Out-Null
    }
    
    # Definir caminho do arquivo
    $filePath = Join-Path $baseDir "$Name.ts"
    
    # Verificar se arquivo já existe
    if (Test-Path $filePath) {
        Write-Error "Arquivo já existe: $filePath"
        return
    }
    
    # Template básico baseado no tipo
    $template = switch ($Type) {
        "service" {
@"
/**
 * $Name
 * Serviço para gerenciamento de $Name
 */

export class $Name {
    constructor() {
        // Inicialização
    }
    
    // Métodos do serviço
}
"@
        }
        "controller" {
@"
/**
 * $Name
 * Controlador para endpoints relacionados a $Name
 */

export class $Name {
    constructor() {
        // Inicialização
    }
    
    // Métodos do controlador
}
"@
        }
        "middleware" {
@"
/**
 * $Name
 * Middleware para $Name
 */

import { Request, Response, NextFunction } from 'express';

export const $Name = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Implementação
        next();
    } catch (error) {
        next(error);
    }
};
"@
        }
        "type" {
@"
/**
 * $Name
 * Tipos e interfaces para $Name
 */

export interface I$Name {
    // Propriedades
}
"@
        }
        default {
@"
/**
 * $Name
 */

// Implementação
"@
        }
    }
    
    # Criar arquivo
    Set-Content -Path $filePath -Value $template -Encoding UTF8
    Write-Host "Arquivo criado: $filePath"
}

# Função para editar um arquivo existente
function Edit-CodeFile {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Path
    )
    
    # Verificar se arquivo existe
    if (-not (Test-Path $Path)) {
        Write-Error "Arquivo não encontrado: $Path"
        return
    }
    
    # Abrir no editor padrão (pode ser configurado)
    Start-Process $Path
}

# Função para atualizar um arquivo
function Update-CodeFile {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Path,
        
        [Parameter(Mandatory=$true)]
        [string]$Content
    )
    
    # Verificar se arquivo existe
    if (-not (Test-Path $Path)) {
        Write-Error "Arquivo não encontrado: $Path"
        return
    }
    
    # Fazer backup do arquivo
    $backupPath = "$Path.bak"
    Copy-Item -Path $Path -Destination $backupPath -Force
    
    try {
        # Atualizar conteúdo
        Set-Content -Path $Path -Value $Content -Encoding UTF8
        Write-Host "Arquivo atualizado: $Path"
        Write-Host "Backup criado: $backupPath"
    }
    catch {
        Write-Error "Erro ao atualizar arquivo: $_"
        # Restaurar backup
        Copy-Item -Path $backupPath -Destination $Path -Force
        Write-Host "Arquivo restaurado do backup"
    }
}

# Função para listar arquivos do projeto
function Get-ProjectFiles {
    param (
        [Parameter(Mandatory=$false)]
        [string]$Directory = $SRC_DIR,
        
        [Parameter(Mandatory=$false)]
        [string]$Pattern = "*.ts"
    )
    
    Get-ChildItem -Path $Directory -Filter $Pattern -Recurse | 
        Select-Object FullName, LastWriteTime, Length
}

# Função para criar teste para um arquivo
function New-TestFile {
    param (
        [Parameter(Mandatory=$true)]
        [string]$SourceFile
    )
    
    # Verificar se arquivo fonte existe
    if (-not (Test-Path $SourceFile)) {
        Write-Error "Arquivo fonte não encontrado: $SourceFile"
        return
    }
    
    # Determinar caminho do teste
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($SourceFile)
    $testDir = Join-Path $BACKEND_DIR "tests"
    $testPath = Join-Path $testDir "$fileName.test.ts"
    
    # Criar diretório de testes se não existir
    if (-not (Test-Path $testDir)) {
        New-Item -ItemType Directory -Path $testDir -Force | Out-Null
    }
    
    # Template básico de teste
    $template = @"
import { $fileName } from '../src/$(Split-Path $SourceFile -Parent | Split-Path -Leaf)/$fileName';

describe('$fileName', () => {
    beforeEach(() => {
        // Setup
    });
    
    afterEach(() => {
        // Cleanup
    });
    
    test('should be defined', () => {
        expect($fileName).toBeDefined();
    });
    
    // Adicione mais testes aqui
});
"@
    
    # Criar arquivo de teste
    Set-Content -Path $testPath -Value $template -Encoding UTF8
    Write-Host "Arquivo de teste criado: $testPath"
}

# Exportar funções
Export-ModuleMember -Function New-CodeFile, Edit-CodeFile, Update-CodeFile, Get-ProjectFiles, New-TestFile
