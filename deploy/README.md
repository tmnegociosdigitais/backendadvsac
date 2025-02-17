# Configuração do Servidor

Este diretório contém os arquivos necessários para configurar o servidor de produção.

## Estrutura
```
deploy/
├── nginx/                  # Configurações do Nginx
│   └── api.advsac.com.conf # Configuração do proxy reverso para a API
└── setup-server.sh        # Script de instalação e configuração
```

## Como usar

1. Clone o repositório na VPS:
```bash
git clone https://github.com/seu-usuario/advsac.git
cd advsac/deploy
```

2. Torne o script executável:
```bash
chmod +x setup-server.sh
```

3. Execute o script de configuração:
```bash
./setup-server.sh
```

## O que o script faz

1. Instala e configura o Nginx
2. Configura o proxy reverso para a API
3. Instala e configura o SSL usando Let's Encrypt
4. Configura renovação automática dos certificados

## Manutenção

- Os certificados SSL são renovados automaticamente
- Logs do Nginx: `/var/log/nginx/`
- Reiniciar Nginx: `systemctl restart nginx`
- Verificar status: `systemctl status nginx`

## Segurança

- Todas as conexões são redirecionadas para HTTPS
- Headers de segurança configurados
- CORS configurado apenas para domínios permitidos
