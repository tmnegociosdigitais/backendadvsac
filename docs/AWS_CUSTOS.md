# Guia de Controle de Custos AWS - ADVSac

## 1. Visão Geral dos Custos

### Serviços Necessários e Custos Estimados
| Serviço          | Configuração                   | Custo Mensal (USD) |
|------------------|--------------------------------|-------------------|
| RDS PostgreSQL   | db.t3.small, 20GB             | ~$30             |
| Backup           | 7 dias retenção               | Incluso          |
| Data Transfer    | 100GB/mês                     | ~$5              |
| **Total Estimado**                               | **~$35**         |

### Limites de Segurança
- Orçamento mensal: $50
- Alerta em: 80% ($40)
- Alerta crítico: 95% ($47.50)

## 2. Configuração de Alertas

### 2.1 Billing Alerts
1. Acessar AWS Console > Billing Dashboard
2. Criar Budget:
   ```
   Tipo: Cost Budget
   Período: Mensal
   Valor: $50
   Alertas:
   - 80% ($40) -> Email de aviso
   - 95% ($47.50) -> Email urgente
   ```

### 2.2 CloudWatch Alerts
```
Métricas para Monitorar:
- FreeStorageSpace
- DatabaseConnections
- CPUUtilization
- FreeableMemory
```

## 3. Configuração RDS Otimizada

### 3.1 Especificações
```
Instance Type: db.t3.small
vCPU: 2
RAM: 2GB
Storage: 20GB gp2 (SSD)
Multi-AZ: Não
Backup: 7 dias
Region: sa-east-1 (São Paulo)
```

### 3.2 Recursos Desativados (Economia)
- Multi-AZ Deployment
- Read Replicas
- Performance Insights
- Enhanced Monitoring
- Auto Minor Version Upgrade
- Storage Autoscaling

## 4. Checklist de Implementação

### 4.1 Pré-Configuração
- [ ] Criar usuário IAM com permissões mínimas
- [ ] Configurar MFA na conta root
- [ ] Definir região para São Paulo
- [ ] Configurar alertas de billing

### 4.2 Configuração RDS
- [ ] Criar VPC dedicada
- [ ] Configurar Security Groups
- [ ] Criar subnet groups
- [ ] Iniciar instância RDS
- [ ] Verificar conectividade

### 4.3 Monitoramento
- [ ] Configurar CloudWatch Logs
- [ ] Criar dashboard de métricas
- [ ] Testar alertas
- [ ] Verificar backup automático

## 5. Prevenção de Custos Extras

### 5.1 Recursos que Podem Gerar Custos Extras
```
❌ Storage Autoscaling
❌ Multi-AZ Deployment
❌ Read Replicas
❌ Performance Insights
❌ Enhanced Monitoring
❌ Snapshots extras
```

### 5.2 Práticas de Economia
1. Manter monitoramento diário do billing
2. Revisar recursos não utilizados
3. Otimizar consultas para reduzir I/O
4. Limitar conexões máximas
5. Usar compression quando possível

## 6. Procedimentos de Emergência

### 6.1 Em Caso de Custos Elevados
1. Verificar Dashboard de Billing
2. Identificar origem do custo
3. Desativar recursos não essenciais
4. Contatar suporte AWS se necessário

### 6.2 Contatos de Emergência
```
AWS Support: https://console.aws.amazon.com/support/
Billing Support: Available 24/7
```

## 7. Escalabilidade Planejada

### 7.1 Gatilhos para Upgrade
- CPU > 70% por 3 dias
- RAM > 80% por 3 dias
- Storage > 80% utilizado
- Conexões > 80% do limite

### 7.2 Próximo Tier (Se Necessário)
```
Upgrade para: db.t3.medium
Custo Adicional: ~$30/mês
Benefícios:
- 4GB RAM
- Melhor performance
- Mais conexões
```

## 8. Monitoramento Diário

### 8.1 Checklist Diário
- [ ] Verificar billing dashboard
- [ ] Revisar métricas RDS
- [ ] Verificar alertas
- [ ] Confirmar backups

### 8.2 Checklist Semanal
- [ ] Analisar tendências de uso
- [ ] Verificar snapshots
- [ ] Revisar logs de acesso
- [ ] Atualizar previsões de custo

## 9. Documentação de Mudanças

Manter registro de todas as alterações:
```
Data | Mudança | Impacto no Custo | Aprovado Por
-----|----------|------------------|-------------
```

## 10. Contatos e Suporte

### AWS Support
- Basic Support: Incluído
- Billing Support: 24/7
- Technical Support: Via Console

### Documentação
- RDS Pricing: https://aws.amazon.com/rds/pricing/
- Best Practices: https://aws.amazon.com/rds/postgresql/
- Cost Management: https://aws.amazon.com/aws-cost-management/
