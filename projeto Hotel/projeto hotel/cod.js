// Verifica se há um usuário logado antes de carregar a página
if (!localStorage.getItem('usuarioLogado')) {
    window.location.href = 'cadastro.html';
}

// Pega o email do usuário logado para carregar e salvar os dados
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
const emailUsuario = usuarioLogado.email;

// Carrega todos os dados do localStorage e, em seguida, os dados específicos do usuário
let todosOsDados = JSON.parse(localStorage.getItem('dadosPorUsuario')) || {};
let dadosDoUsuario = todosOsDados[emailUsuario] || {
    produtos: [],
    movimentos: {},
    produtoSelecionado: null
};

// Atribui os dados do usuário às variáveis de trabalho
let produtos = dadosDoUsuario.produtos;
let produtoSelecionado = null; // Precisa ser re-selecionado a cada sessão
let movimentos = dadosDoUsuario.movimentos;

// Função para salvar os dados específicos do usuário no localStorage
function salvarDados() {
    todosOsDados[emailUsuario] = {
        produtos: produtos,
        movimentos: movimentos
    };
    localStorage.setItem('dadosPorUsuario', JSON.stringify(todosOsDados));
}

// Função de importação do arquivo XLS
function importarArquivo() {
    const arquivo = document.getElementById('arquivoXLS').files[0];
    if (!arquivo) {
        alert('Por favor, selecione um arquivo.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const planilha = workbook.Sheets[workbook.SheetNames[0]];
        const produtosImportados = XLSX.utils.sheet_to_json(planilha, { header: 1 });

        produtos = produtosImportados.slice(1).map(produto => ({
            id: produto[0] || 'Não informado',
            nome: produto[1] || 'Não informado',
            categoria: produto[2] || 'Não informado',
            estoque: produto[3] || 0,
            status: produto[4] || 'Em estoque',
            observacoes: produto[5] || 'Sem observações',
        }));

        salvarDados();
        exibirEstoque();
        alert('Arquivo importado com sucesso!');
    };
    reader.readAsArrayBuffer(arquivo);
}

// Exibe os produtos na tabela ou uma mensagem de "sem produtos"
function exibirEstoque() {
    const tabelaEstoque = document.getElementById('tabelaEstoque').getElementsByTagName('tbody')[0];
    tabelaEstoque.innerHTML = '';
    
    if (produtos.length === 0) {
        const row = tabelaEstoque.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 7;
        cell.textContent = "Nenhum produto encontrado. Por favor, importe uma planilha.";
        cell.style.textAlign = "center";
        cell.style.padding = "20px";
    } else {
        produtos.forEach(produto => {
            const row = tabelaEstoque.insertRow();
            row.setAttribute('data-id', produto.id);

            row.insertCell(0).textContent = produto.id;
            row.insertCell(1).textContent = produto.nome;
            row.insertCell(2).textContent = produto.categoria;
            row.insertCell(3).textContent = produto.estoque;
            row.insertCell(4).textContent = produto.status;
            row.insertCell(5).textContent = produto.observacoes;

            const cellAção = row.insertCell(6);
            cellAção.classList.add('action-buttons');

            const botaoEditar = document.createElement('button');
            botaoEditar.textContent = 'Editar';
            botaoEditar.classList.add('edit-btn');
            botaoEditar.onclick = () => editarProduto(produto.id);
            cellAção.appendChild(botaoEditar);

            const botaoExcluir = document.createElement('button');
            botaoExcluir.textContent = 'Excluir';
            botaoExcluir.classList.add('delete-btn');
            botaoExcluir.onclick = () => excluirProduto(produto.id);
            cellAção.appendChild(botaoExcluir);
        });
    }
}

// Remove um produto da lista
function excluirProduto(produtoId) {
    produtos = produtos.filter(produto => produto.id !== produtoId);
    salvarDados();
    exibirEstoque();
}

// Ativa os campos para editar o produto selecionado
function editarProduto(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
        produtoSelecionado = produto;
        document.getElementById('controleEntradaSaida').style.display = 'block';
        mostrarHistoricoMensal(produto.id);
    }
}

// Busca produtos por nome na tabela
function buscarProduto() {
    const filtro = document.getElementById('buscarProduto').value.toLowerCase();
    const tabelaEstoque = document.getElementById('tabelaEstoque').getElementsByTagName('tbody')[0];
    const rows = tabelaEstoque.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const nomeProduto = row.cells[1].textContent.toLowerCase();
        row.style.display = nomeProduto.includes(filtro) ? '' : 'none';
    });

    if (!filtro) {
        document.getElementById('controleEntradaSaida').style.display = 'none';
        document.getElementById('historicoMensal').style.display = 'none';
    }
}

// Registra a entrada e saída de produtos
function registrarMovimento() {
    const quantidadeEntrada = parseInt(document.getElementById('quantidadeEntrada').value) || 0;
    const quantidadeSaida = parseInt(document.getElementById('quantidadeSaida').value) || 0;

    if (!produtoSelecionado) {
        alert('Nenhum produto selecionado para registrar o movimento.');
        return;
    }

    if (quantidadeEntrada > 0) {
        produtoSelecionado.estoque += quantidadeEntrada;
        registrarMovimentoMensal(produtoSelecionado.id, 'entrada', quantidadeEntrada);
    }

    if (quantidadeSaida > 0) {
        produtoSelecionado.estoque -= quantidadeSaida;
        registrarMovimentoMensal(produtoSelecionado.id, 'saida', quantidadeSaida);
    }

    salvarDados();
    exibirEstoque();
    alert('Movimento registrado!');
}

// Registra o movimento mensal (entrada/saída)
function registrarMovimentoMensal(idProduto, tipo, quantidade) {
    const hoje = new Date();
    const mesAno = `${hoje.getMonth() + 1}/${hoje.getFullYear()}`;

    if (!movimentos[idProduto]) {
        movimentos[idProduto] = {};
    }

    if (!movimentos[idProduto][mesAno]) {
        movimentos[idProduto][mesAno] = { entradas: 0, saidas: 0 };
    }

    if (tipo === 'entrada') {
        movimentos[idProduto][mesAno].entradas += quantidade;
    } else if (tipo === 'saida') {
        movimentos[idProduto][mesAno].saidas += quantidade;
    }

    salvarDados();
    mostrarHistoricoMensal(idProduto);
}

// Mostra o histórico mensal de um produto selecionado
function mostrarHistoricoMensal(idProduto) {
    const historicoTabela = document.getElementById('historicoTabela');
    historicoTabela.innerHTML = '';

    const historico = movimentos[idProduto] || {};
    for (const mesAno in historico) {
        const row = historicoTabela.insertRow();
        row.insertCell(0).textContent = mesAno;
        row.insertCell(1).textContent = historico[mesAno].entradas;
        row.insertCell(2).textContent = historico[mesAno].saidas;
    }

    document.getElementById('historicoMensal').style.display = 'block';
}

// Inicia a exibição do estoque ao carregar a página
document.addEventListener('DOMContentLoaded', exibirEstoque);