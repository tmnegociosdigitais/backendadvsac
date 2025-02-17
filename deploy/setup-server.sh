#!/bin/bash

# Atualizar o sistema
apt update
apt upgrade -y

# Instalar nginx e certbot
apt install nginx certbot python3-certbot-nginx -y

# Copiar configurações do nginx
cp nginx/api.advsac.com.conf /etc/nginx/sites-available/
ln -s /etc/nginx/sites-available/api.advsac.com /etc/nginx/sites-enabled/

# Remover configuração padrão
rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar nginx
nginx -t && systemctl restart nginx

# Gerar certificados SSL
certbot --nginx -d api.advsac.com --non-interactive --agree-tos --email seu-email@advsac.com

# Configurar renovação automática dos certificados
certbot renew --dry-run
