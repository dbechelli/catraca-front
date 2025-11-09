# 🚀 INÍCIO RÁPIDO - Frontend

## ⚡ Testando Localmente (5 minutos)

### 1️⃣ Baixar e extrair

[Baixe o frontend aqui](computer:///mnt/user-data/outputs/catraca-frontend.tar.gz)

```bash
# Windows PowerShell
tar -xzf catraca-frontend.tar.gz
cd catraca-frontend

# Ou use 7-Zip/WinRAR
```

### 2️⃣ Instalar dependências

```bash
npm install
```

### 3️⃣ Verificar/editar a URL da API

O arquivo `.env` já está configurado:

```env
VITE_API_URL=https://catracatransleg.visualsoftia.cloud
```

Se precisar mudar, edite o arquivo `.env`

### 4️⃣ Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:5173**

✅ **Pronto!** O frontend está rodando!

---

## 🎯 O que você verá

### Tela Principal

```
┌─────────────────────────────────────────────────┐
│  🍽️ Sistema de Controle de Catracas            │
│     [Status: Conectado] [Atualizar]            │
├─────────────────────────────────────────────────┤
│                                                 │
│  📤 UPLOAD DE ARQUIVOS                         │
│  ┌──────────────┐  ┌──────────────┐           │
│  │  Catraca 01  │  │  Catraca 02  │           │
│  │  [Arraste]   │  │  [Arraste]   │           │
│  └──────────────┘  └──────────────┘           │
│                                                 │
│  📊 INDICADORES                                │
│  [☕ Café] [🍽️ Almoço] [🌙 Janta] [⚠️ Duplicados]│
│                                                 │
│  🔍 FILTROS                                    │
│  [Nome] [Data] [Catraca] [Período] [Duplicados]│
│                                                 │
│  📋 REGISTROS                                   │
│  Tabela com todos os registros...              │
└─────────────────────────────────────────────────┘
```

---

## 🧪 Testando

### 1. Upload de Arquivo

1. Arraste um arquivo Excel para o card da Catraca 01
2. Aguarde o processamento
3. Veja os indicadores atualizarem
4. Confira a tabela preenchida

### 2. Usando Filtros

- **Nome**: Digite "João" para filtrar
- **Data**: Selecione uma data
- **Catraca**: Escolha 01 ou 02
- **Período**: Selecione Café, Almoço ou Janta
- **Duplicados**: Marque "Apenas duplicados"

### 3. Ordenação

Clique nos cabeçalhos da tabela para ordenar:
- Nome (A-Z / Z-A)
- Data (mais recente / mais antiga)
- Tempo (maior / menor)

### 4. Atualizar Dados

Clique no botão **"Atualizar"** no canto superior direito

---

## 📸 Funcionalidades

### ✅ Upload
- Drag & drop funcional
- Validação de formato
- Feedback visual (loading, sucesso, erro)
- Suporta 2 catracas

### ✅ Indicadores
- 4 cards coloridos
- Atualização em tempo real
- Média de minutos por grupo
- Total de duplicados

### ✅ Filtros
- 5 tipos de filtro
- Botão "Limpar filtros"
- Atualização automática da tabela

### ✅ Tabela
- Ordenação clicável
- Destaque vermelho para duplicados
- Scroll horizontal (mobile)
- Ícones intuitivos

---

## 🎨 Temas Visuais

### Cards de Indicadores

- **Café**: Azul (#3B82F6)
- **Almoço**: Verde (#10B981)
- **Janta**: Roxo (#8B5CF6)
- **Duplicados**: Vermelho (#EF4444)

### Estados

- **Normal**: Cinza claro
- **Hover**: Sombra aumenta
- **Duplicado**: Fundo vermelho claro
- **Loading**: Animação de pulso

---

## 🐛 Problemas Comuns

### "Desconectado" no header

**Causa**: API não está respondendo

**Solução**:
1. Verifique se a API está rodando
2. Teste a URL: `https://catracatransleg.visualsoftia.cloud/health`
3. Veja o console do navegador (F12)

### Upload não funciona

**Causa**: Formato de arquivo incorreto ou API com problema

**Solução**:
1. Use apenas arquivos .xlsx ou .xls
2. Veja o console (F12) para erros
3. Teste upload no Postman primeiro

### Tabela vazia

**Causa**: Sem dados no banco ou filtros muito restritivos

**Solução**:
1. Clique em "Limpar filtros"
2. Faça upload de um arquivo
3. Clique em "Atualizar"

---

## 🚀 Deploy (Quando Pronto)

### Build de Produção

```bash
npm run build
```

Isso cria a pasta `dist/` com arquivos otimizados.

### Deploy no Coolify

1. Subir código para Git
2. Criar app no Coolify
3. Build Pack: **Static Site**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Adicionar variável: `VITE_API_URL`
7. Deploy!

---

## 📋 Checklist de Testes

- [ ] Servidor dev iniciou (npm run dev)
- [ ] Abre em http://localhost:5173
- [ ] Status mostra "Conectado"
- [ ] Upload de arquivo funciona
- [ ] Indicadores atualizam
- [ ] Filtros funcionam
- [ ] Tabela ordena ao clicar
- [ ] Duplicados em vermelho
- [ ] Responsivo no mobile

---

## 💡 Dicas

### Desenvolvimento

- Use **React DevTools** (extensão do Chrome)
- Abra o **Console** (F12) para ver logs
- Use **Network tab** para debug de API

### Performance

- Build de produção é muito menor
- Tailwind remove CSS não usado
- Vite faz hot reload automático

### Customização

- **Cores**: Edite `tailwind.config.js`
- **API URL**: Mude no `.env`
- **Componentes**: Está tudo em `src/components/`

---

## 🎯 Próximos Passos

1. ✅ Testar localmente
2. 🔜 Customizar (se quiser)
3. 🔜 Build de produção
4. 🔜 Deploy no Coolify
5. 🔜 Configurar domínio

---

**Tudo funcionando? Bora fazer deploy! 🚀**
