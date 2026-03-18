//troca de tela
function mostrarTela(id) {
    document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));
if ((id === "relatorio" || id === "graficos-prici" || id === "tabela") && produtos.length === 0) {
        alert("Não há produtos para analisar");
                id= "Calculadora";

    }
    document.getElementById(id).classList.add('ativa');

    document.querySelectorAll('#menu button').forEach(botao => botao.classList.remove('ativo'));

    const botaoAtivo =
    document.querySelector(
        `#menu button[onclick*="${id}"]`);

    if (botaoAtivo)botaoAtivo.classList.add('ativo');

    mostrarRelatorio();
}

//variavel global
const produtos = [];


function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  if (produtos.length === 0) {
        alert("Cadastre pelo menos um produto antes de gerar o relatório.");
        return;
    }
  doc.text("Relatório de Indicadores de desempenho", 10, 10);

  // Monta os dados da tabela
  const dados = produtos.map(p => {
    return [
      p.produto,
      p.estoqueFisico,
      p.estoqueVirtual,
      p.vendaTotal, p.totalPedidos,
      calcularGiro(p).toFixed(2),
      calcularConsumoMedio(p).toFixed(1),
      calcularCobertura(p).toFixed(0) + " dias",
      calcularRuptura(p).toFixed(1) + "%",
      p.periodo
    ];
  });

  // Define os cabeçalhos
  const cabecalho = ["Produto", "Estoque fisico", "Estoque virtual", "Total de vendas", "Total de pedidos", "Giro", "Consumo médio", "Cobertura", "Ruptura", "Periodo"];

  // Adiciona a tabela
  doc.autoTable({
    head: [cabecalho],
    body: dados,
    startY: 20, // Começa abaixo do título
    theme: 'grid',
       headStyles: { fillColor: [20, 20, 20], textColor: 255 },
       
       columnStyles: {
    
    0: { cellWidth: 19 }, // Produto
    1: { cellWidth: 20 }, // Estoque físico
    2: { cellWidth: 20 }, // Estoque virtual
    3: { cellWidth: 20 }, // Total de vendas
    4: { cellWidth: 20 }, // Total de pedidos
    5: { cellWidth: 15 }, // Giro
    6: { cellWidth: 20 }, // Consumo médio
    7: { cellWidth: 20 }, // Cobertura
    8: { cellWidth: 20 }, // Ruptura
    9: { cellWidth: 17}  //
       },
didParseCell: function (data) {


  if (data.section === "body") {

    const produto = produtos[data.row.index];

    // Giro
    if (data.column.index === 5) {
      const giro = calcularGiro(produto);
      const nivel = nivelGiroDeEstoque(giro);
      data.cell.styles.fillColor = corNivel(nivel);
    }
        if (data.column.index === 6) {
const consumo = calcularConsumoMedio(produto);
      const nivel = nivelDeConsumoM(produto, consumo);
      data.cell.styles.fillColor = corNivel(nivel);
    }

    // Cobertura
    if (data.column.index === 7) {
      const cobertura = calcularCobertura(produto);
      const nivel = nivelCobertura(produto, cobertura);
      data.cell.styles.fillColor = corNivel(nivel);
    }

    // Ruptura
    if (data.column.index === 8) {
      const ruptura = calcularRuptura(produto);
      const nivel = nivelRuptura(produto, ruptura);
      data.cell.styles.fillColor = corNivel(nivel);
    }

  }

}  
    

  });
  doc.save("relatorio-estoque.pdf");
}

//amarzena os valores dos inputs
function armazenarvalor() {
    const produto = {
        produto:
        document.getElementById('nomeDoProdutoPricipal').value,
        estoqueFisico:
        Number(document.getElementById('estoqueFisico').value),
        estoqueVirtual:
        Number(document.getElementById('estoqueVirtual').value),
        vendaTotal:
        Number(document.getElementById('vendaTotal').value),
        tempoRepo:
        Number(document.getElementById('tempoRepo').value),
        totalPedidos:
        Number(document.getElementById('totalDePedidos').value),
        periodo: document.getElementById('periodo').value
    };
    if (!produto.produto || produto.estoqueFisico < 0 || produto.estoqueVirtual < 0 || produto.vendaTotal < 0 || produto.tempoRepo < 0 || produto.totalPedidos <= 0) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }



    produtos.push(produto);
    salvarLocalStorage();
    mostrarTabela();
document.getElementById("informacoes").reset();
}

// amarzenar e definir os niveis do valor dos indicadores:

//Giro de estoque
function calcularGiro(item) {
    return item.vendaTotal / ((item.estoqueFisico + item.estoqueVirtual) / 2);
}
function analizargiro(analize) {
    const analizeNivel = {
        "Bom": {
            causa: ["Estoque adequado",
                " boa rotatividade"],
            sugestao: ["Manter Monitoramento regular"]
        },

        "Medio": {
            causa: ["Possiveis falhas na reposiçao",
                " validade ultrapassada",
                "Lesão de produto"],
            sugestao: ["Manter Monitoramento regular"]
        },

        "Ruim": {
            causa: ["Baixa demanda",
                " Estoque parado",
                " Produto avariado ou vencido"],
            sugestao: ["Realizar inventario",
                " Redefinir tempo de reposição"]
        },

    };
    return analizeNivel[analize]  || { causa: [], sugestao: [] };
}
function nivelGiroDeEstoque(giro) {
    if (giro >= 3) return "Bom";
    if (giro >= 1.6) return "Medio";
    return "Ruim";

}

//Connsumo Medio
// Cobertura de estoque = estoque total / consumo médio diário
function calcularConsumoMedio(item) {

    let dias;

    if (item.periodo === "Dia") {
        dias = 1;
    } else if (item.periodo === "Mes") {
        dias = 30;
    } else if (item.periodo === "Ano") {
        dias = 365;
    }
    if (!item.vendaTotal || item.vendaTotal === 0) return 0;
    return item.vendaTotal/dias;

}
function nivelDeConsumoM(item, consumoM) {

    const estoqueTotal = item.estoqueFisico + item.estoqueVirtual;

    if (consumoM === 0) return "Ruim";

    const cobertura = estoqueTotal / consumoM;

    if (cobertura <= 30) return "Bom";
    if (cobertura <= 60) return "Medio";
    return "Ruim";
}
function analisarConsumo(nivel) {
    const analizeNivel = {
        "Bom": {
            causa: ["Consumo compatível com o estoque"],
            sugestao: ["Manter monitoramento"]
        },
        "Medio": {
            causa: ["Possível aumento de demanda"],
            sugestao: ["Avaliar reposição"]
        },
        "Ruim": {
            causa: ["Risco de ruptura",
                ],
            sugestao: ["Rever política de estoque"]
        }
    };
    return analizeNivel[nivel]  || { causa: [], sugestao: [] };
}

//Cobertura de estoque
function calcularCobertura(item) {
    const consumoMedio = calcularConsumoMedio(item);
    if (consumoMedio === 0) return 0;

    return (item.estoqueFisico + item.estoqueVirtual) / consumoMedio;
}
function nivelCobertura(item, cobertura) {
    if (cobertura >= item.tempoRepo) return "Bom";
    if (cobertura >= item.tempoRepo * 0.5) return "Medio";
    return "Ruim";
}
function analisarCobertura(nivel){
    const analise = {
        "Bom":{
            causa:["Estoque suficiente para atender a demanda"],
            sugestao:["Manter política de reposição atual"]
        },
        "Medio":{
            causa:["Cobertura próxima do limite"],
            sugestao:["Monitorar reposição e vendas"]
        },
        "Ruim":{
            causa:["Risco de ruptura de estoque"],
            sugestao:["Aumentar estoque de segurança"]
        }
    };
    return analise[nivel]  || { causa: [], sugestao: [] };
}

//Ruptura de estoque
function calcularRuptura(item) {
            let faltou = item.totalPedidos - item.vendaTotal;


        if (faltou < 0) {
            faltou = 0;
        }


        const indiceDeRuptura = (faltou /item.totalPedidos) * 100;
        
    return indiceDeRuptura;
    
}
function nivelRuptura(item, ruptura) {
    if (ruptura <= 10) return "Bom";
    if (ruptura <= 30) return "Medio";
    return "Ruim";
}
function analisarRuptura(nivel){
    const analise = {
        "Bom":{
            causa:["Estoque suficiente para atender a demanda, boa rotatividade"],
            sugestao:["Manter política de reposição atual"]
        },
        "Medio":{
            causa:["Atraso de fornecedor", "Atraso de reposição"],
            sugestao:["Monitorar reposição e vendas"]
        },
        "Ruim":{
            causa:["Previsão de demanda imprecisa",
"Atraso de fornecedor", "Estoque de segurança insuficiente"],
            sugestao:["Revisar ponto de reposição", 
"Ajustar estoque de segurança"]
        }
    };
    return analise[nivel]  || { causa: [], sugestao: [] };
}



//faaz os calculos e a tabela
function mostrarTabela() {


    const grafico =
    document.getElementById('graficos');
    grafico.innerHTML = "";


        if (produtos.length === 0) {
const barra =
document.createElement("div");
barra.classList.add("linha");
barra.innerHTML="<p>Não há produtos</p>"

grafico.appendChild(barra);

        }


    produtos.forEach((item, index)=> {
        const produt = item.produto;



        const giroDeEstoque = calcularGiro(item);



        const indiceDeRuptura = calcularRuptura(item);

        const consumoMedio = calcularConsumoMedio(item);
        
        const coberturaDeEstoque = calcularCobertura(item);


        console.log("Giro de Estoque:", giroDeEstoque.toFixed(0));
        console.log("Cobertura de Estoque (dias):", coberturaDeEstoque.toFixed(0));
        console.log("Índice de Ruptura (%):", indiceDeRuptura.toFixed(1), "%");

        const larguraBarra = Math.min(coberturaDeEstoque, 100);





        const barra = document.createElement("div");
        barra.classList.add("linha");

        const preenchimento = document.createElement("div");
        preenchimento.classList.add("preenchimentop");
        preenchimento.innerHTML = `
        <p>${produt}</p>
        <p>${giroDeEstoque.toFixed(1)}</p>
        <p>${consumoMedio.toFixed(2)}</p>
        <p>${coberturaDeEstoque.toFixed(0)}</p>
        <p>${indiceDeRuptura.toFixed(1)}%</p>
        <button class="editar" onclick="editar(${index})">Editar</button>
        <button class="excluir" onclick="excluirItem(${index})">Excluir</button>


        `;

        barra.appendChild(preenchimento);
        grafico.appendChild(barra);
    });
    gerarGraficoGiro();
    gerarGraficoConsumo();
    gerarGraficoCbertura();
    gerarGraficoRuptura();
    filtrarTabela();
}
function filtrarTabela(){


const filtro =
document.getElementById("pesquisa-produto")
.value.toLowerCase()

const linhas =
document.querySelectorAll("#graficos .linha")

linhas.forEach(linha => {
    const resultado =
    linha.textContent.toLowerCase()
linha.className = "linha"


if(resultado.includes(filtro)){
linha.style.display=""
}else
{
linha.style.display = "none"

    
}
})

console.log(document.querySelectorAll(".linha"))

}
function mostrarIndicador(indicador) {
    // Pega todas as linhas, inclusive o header
    const linhas = document.querySelectorAll("#header-graficos .linha, #graficos .linha");
    
    
const headerColunas = document.querySelectorAll("#header-graficos .linha p");
headerColunas.forEach((col, i) => {
    col.style.display = (indicador === "todos" || i === 0 || i === indicador) ? "" : "none";
});


    linhas.forEach(linha => {
        // Pega os filhos da linha (colunas)
        const colunas = linha.children[0].children || linha.children; // no header ou preenchimento

        for (let i = 0; i < colunas.length; i++) {
            if (indicador === "todos" || i === 0 || i === indicador) {
                colunas[i].style.display = "";
            } else {
                colunas[i].style.display = "none";
            }
        }
    });
  document.querySelectorAll('.botao-filtro').forEach(b => b.classList.remove('ativo'));
const botaoAtivo = Array.from(document.querySelectorAll('.botao-filtro'))
    .find(b => b.getAttribute('onclick').includes(`mostrarIndicador(${indicador})`));
if (botaoAtivo) botaoAtivo.classList.add('ativo');
}
//Excluir o item unico
function excluirItem(index) {
    produtos.splice(index,
        1);
    salvarLocalStorage();
    mostrarTabela();
}
//botao de Excluir calculo
const abrirformapagartudo =
document.getElementById('apagarTudo');
const formapagar =
document.getElementById('form-excluir');
const apagarTudo =
document.querySelector('.confirmar');
const cancelar =
document.querySelector('.cancelar');

abrirformapagartudo.addEventListener("click", () => {
    formapagar.style.display = "block";
});
apagarTudo.addEventListener("click", () => {
    produtos.length = 0;
    salvarLocalStorage();
    mostrarTabela();
    formapagar.style.display = "none";
});
cancelar.addEventListener("click", () => {
    formapagar.style.display = "none";
})

//grafico de Giro de Estoque
function gerarGraficoGiro() {
    const canvas = document.getElementById("graficoGiro");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0,
        0,
        canvas.width,
        canvas.height);

    const valores = produtos.map(p =>
        p.vendaTotal / ((p.estoqueFisico + p.estoqueVirtual) / 2)
    );

    const max = Math.max(...valores,
        1);
    const larguraBarra = 40;
    const gap = 20;
    const margem = 30;
    canvas.width = margem + produtos.length * (larguraBarra + gap) + 100;
    canvas.height = 300;

    valores.forEach((valor, i) => {
        const altura = (valor / max) * 200;
        let corTexto;

        if (valor >= 3) {
            ctx.strokeStyle = "#80ffa2";
            ctx.fillStyle = "rgba(128, 255, 162, 0.3)";
            corTexto = "#080";
        } else if (valor >= 1.6) {
            ctx.strokeStyle = "orange";
            ctx.fillStyle = "rgba(255, 165, 0, 0.3)";
            corTexto = "#e65c00";
        } else {
            ctx.strokeStyle = "red";
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            corTexto = "#c00";
        }
        const x = 50 + i * (larguraBarra + gap);
        ctx.lineWidth = 2;
        ctx.strokeRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        )
        ctx.fillRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        );
        const ytopo = 250 - altura;
        ctx.textAlign = "center";
        ctx.fillStyle = corTexto;
        ctx.fillText(valor.toFixed(0), x + larguraBarra/2, ytopo-5);

        ctx.fillStyle = "#fff";
        ctx.fillText(produtos[i].produto, x + larguraBarra/2, 270);
    });
}

//grafico de Consumo
function gerarGraficoConsumo() {

    const canvas =
    document.getElementById("graficoConsumo");
    const ctx = canvas.getContext("2d");


    ctx.clearRect(0,
        0,
        canvas.width,
        canvas.height);

    const valores = produtos.map(p => {


const valorConsumo = 
calcularConsumoMedio(p);

        return valorConsumo;
    }
    );

    const max = Math.max(...valores,
        1);

    const larguraBarra = 40;
    const gap = 20;

    const margem = 30;
    canvas.width = margem + produtos.length * (larguraBarra + gap) + 100;
    canvas.height = 300;
    valores.forEach((valor, i) => {
        const item = produtos[i];
        const altura = (valor / max) * 200;
        let corTexto;
const nivel = nivelDeConsumoM(item, valor);

if (nivel === "Bom") {
    ctx.strokeStyle = "#80ffa2";
    ctx.fillStyle = "rgba(128, 255, 162, 0.3)";
    corTexto = "#080";
}
else if (nivel === "Medio") {
    ctx.strokeStyle = "orange";
    ctx.fillStyle = "rgba(255, 165, 0, 0.3)";
    corTexto = "#e65c00";
}
else {
    ctx.strokeStyle = "red";
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    corTexto = "#c00";
}
        const x = 50 + i * (larguraBarra + gap);
        ctx.lineWidth = 2;
        ctx.strokeRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        )
        ctx.fillRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        );
        const ytopo = 250 - altura;
        ctx.textAlign = "center";
        ctx.fillStyle = corTexto;
        ctx.fillText(valor.toFixed(0), x + larguraBarra/2, ytopo-5);

        ctx.fillStyle = "#fff";
        ctx.fillText(produtos[i].produto, x + larguraBarra/2, 270);


    });
}

//grafico de Cobretura
function gerarGraficoCbertura() {
    const canvas =
    document.getElementById("graficoCobertura");
    const ctx = canvas.getContext("2d");


    ctx.clearRect(0,
        0,
        canvas.width,
        canvas.height);

    const valores = produtos.map(p => {


        const coberturaDeEstoque = calcularCobertura(p);
        return coberturaDeEstoque;

    });


    const max = Math.max(...valores,
        1);

    const larguraBarra = 40;
    const gap = 20;

    const margem = 30;
    canvas.width = margem + produtos.length * (larguraBarra + gap) + 100;
    canvas.height = 300;
    valores.forEach((valor, i) => {
        const item = produtos[i];
        const altura = (valor / max) * 200;
        let dias = 1;
        if (item.periodo === "mes") dias = 30;
        else if (item.periodo === "Ano") dias = 365;
        let corTexto;
        const cobertura = calcularCobertura(item);

        if (cobertura >= item.tempoRepo) {
            ctx.strokeStyle = "#80ffa2";
            ctx.fillStyle = "rgba(128, 255, 162, 0.3)";
            corTexto = "#080";
        } else if (cobertura >= item.tempoRepo *0.5) {
            ctx.strokeStyle = "orange";
            ctx.fillStyle = "rgba(255, 165, 0, 0.3)";
            corTexto = "#e65c00";
        } else {
            ctx.strokeStyle = "red";
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            corTexto = "#c00";
        }




        const x = 50 + i * (larguraBarra + gap);
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 250 - altura, larguraBarra, altura);
        ctx.fillRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        );
        const ytopo = 250 - altura;
        ctx.textAlign = "center";
        ctx.fillStyle = corTexto;
        ctx.fillText(valor.toFixed(0), x + larguraBarra/2, ytopo-5);

        ctx.fillStyle = "#fff";
        ctx.fillText(produtos[i].produto, x+ larguraBarra/2, 270);


    });
}

//grafico de Ruptura
function gerarGraficoRuptura() {
    const canvas = document.getElementById("graficoRuptura");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0,
        0,
        canvas.width,
        canvas.height);

    const valores = produtos.map(p => {

const valorRuptura = calcularRuptura(p);
        return valorRuptura;
        
    });

    const max = 100;
    const larguraBarra = 40;
    const gap = 20;
    const margem = 30;
    canvas.width = margem + produtos.length * (larguraBarra + gap) + 100;
    canvas.height = 300;

    // 2. Desenha a escala lateral
    ctx.fillStyle = "#fff";
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
        // 0%, 20%, 40%, 60%, 80%, 100%
        const y = 250 - (i / 5) * 200;
        ctx.fillText((i * 20) + "%", 40, y + 5);
        // +5 pra alinhar verticalmente
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(45, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    valores.forEach((valor, i) => {
        const altura = (valor / max) * 200;
        let corTexto;

        if (valor <= 10) {
            ctx.strokeStyle = "#80ffa2";
            ctx.fillStyle = "rgba(128, 255, 162, 0.3)";
            corTexto = "#080";
        } else if (valor <= 30) {
            ctx.strokeStyle = "orange";
            ctx.fillStyle = "rgba(255, 165, 0, 0.3)";
            corTexto = "#e65c00";
        } else {
            ctx.strokeStyle = "red";
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            corTexto = "#c00";
        }
        const x = 50 + i * (larguraBarra + gap);
        ctx.lineWidth = 2;
        ctx.strokeRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        )
        ctx.fillRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        );
        const ytopo = 250 - altura;
        ctx.textAlign = "center";
        ctx.fillStyle = corTexto;
        ctx.fillText(valor.toFixed(0)+ "%", x + larguraBarra/2, ytopo-5);

        ctx.fillStyle = "#fff";
        ctx.fillText(produtos[i].produto, x + larguraBarra/2, 270);
    });
}

// salvar alterações no navegador
function salvarLocalStorage() {
    localStorage.setItem("produtos",
        JSON.stringify(produtos));
}

//carrega os dados no navegador
function carregarDados() {
    const dados =
    localStorage.getItem("produtos");
    if (dados) {
        produtos.length = 0;
        produtos.push(...JSON.parse(dados));
        mostrarTabela();
    }
}
let indexEdicao = null;

//editar valor do calculo ou ver ele
function editar(index) {
    indexEdicao = index;
    document.getElementById('editarFor').style.display = "block";

    document.getElementById('noproduto').value = produtos[index].produto;

    document.getElementById('esFisico').value =
    produtos[index].estoqueFisico;

    document.getElementById('esvirtual').value = produtos[index].estoqueVirtual;

    document.getElementById('TotalDevendas').value =
    produtos[index].vendaTotal;

    document.getElementById('tempo').value =
    produtos[index].tempoRepo;

    document.getElementById('totalPedido').value =
    produtos[index].totalPedidos;
}
//salvar editagem no valor pra ser calculado
function salvarEdicao() {
    if (indexEdicao === null)return;
    const p = produtos[indexEdicao];
    p.produto =
    document.getElementById('noproduto').value;
    p.estoqueFisico =
    Number(document.getElementById('esFisico').value);
    p.estoqueVirtual =
    Number(document.getElementById('esvirtual').value);
    p.vendaTotal =
    Number(document.getElementById('TotalDevendas').value);
    p.tempoRepo =
    Number(document.getElementById('tempo').value);
    p.totalPedidos =
    Number(document.getElementById('totalPedido').value);
    salvarLocalStorage();
    mostrarTabela();
    document.getElementById('editarFor').style.display = "none";

}
//fechar o formulario de editar se mudar o valor
function voltar() {
    document.getElementById('editarFor').style.display = "none";

}

//Cores dos niveis
function corNivel(nivel) {
    const cores = {
        "Bom": "#4a7c59",
        "Medio": "#c68c3f",
        "Ruim": "#FF6347"
    };
    return cores[nivel] || "#fff";

}

function mostrarRelatorio() {
    const gerarRelatorio =
    document.getElementById('relatorio');
    gerarRelatorio.innerHTML = "";

    const giroNivel = {
        Bom: [],
        Medio: [],
        Ruim: []
    };
    const consumoNivel = {
        Bom: [],
        Medio: [],
        Ruim: []
    };
    const coberturaNivel = {
        Bom: [],
        Medio: [],
        Ruim: []
    }
    const rupturaNivel = {
        Bom: [],
        Medio: [],
        Ruim: []
    }



    produtos.forEach(p => {
        const giro = calcularGiro(p);
        const consumoM = calcularConsumoMedio(p);
      const coberturaE = calcularCobertura(p);
      const rupturaE = calcularRuptura(p);
        const nivelCM =
        nivelDeConsumoM(p, consumoM);
        consumoNivel[nivelCM].push({
            nome: p.produto,
            consumoM: consumoM
        });

        const nivelG =
        nivelGiroDeEstoque(giro);
        giroNivel[nivelG].push({
            nome: p.produto,
            giro: giro
        });
        
                const nivelCo =
        nivelCobertura(p, coberturaE);
        
        coberturaNivel[nivelCo].push({
            nome: p.produto,
            coberturaE: coberturaE
        });
        const nivelRup=
        nivelRuptura(p,rupturaE);
        rupturaNivel[nivelRup].push({
            nome: p.produto,
            rupturaE: rupturaE
        });
        
    });


    const relatorio =
    document.createElement('div');
    relatorio.className = "relatorio";

relatorio.innerHTML = `
<br>

<h1>Relatório</h1>
<br>     

<div class="container-relatorioN">
<h2>Giro de estoque</h2>
<br>
<div class="container-coluna">

${['Bom','Medio','Ruim'].map(nivel => `
<div class="coluna" style="box-shadow: 0 1px 4px ${corNivel(nivel)}">
<h2>${nivel}</h2>

<div class="separar-local">
${giroNivel[nivel].map(p => `
<p><span>${p.nome}</span><span>${p.giro.toFixed(2)}</span></p>
`).join("")}
</div>

${giroNivel[nivel].length === 0 
? "<p>Não há produtos nessa classificação</p>"
: `
<h4>Causas:</h4>
<ul>
${analizargiro(nivel).causa.map(c => `<li>${c}</li>`).join("")}
</ul>

<h4>Sugestão:</h4>
<ul>
${analizargiro(nivel).sugestao.map(s => `<li>${s}</li>`).join("")}
</ul>
`}
</div>
`).join("")}

</div>
</div>


<div class="container-relatorioN">
<h2>Consumo Médio</h2>
<br>
<div class="container-coluna">

${['Bom','Medio','Ruim'].map(nivel => `
<div class="coluna" style="box-shadow: 0 1px 3px ${corNivel(nivel)}">
<h2>${nivel}</h2>

<div class="separar-local">
${consumoNivel[nivel].map(p => `
<p><span>${p.nome}</span><span>${p.consumoM.toFixed(1)}</span></p>
`).join("")}
</div>

${consumoNivel[nivel].length === 0 
? "<p>Não há produtos nessa classificação</p>"
: `
<h4>Causas:</h4>
<ul>
${analisarConsumo(nivel).causa.map(c => `<li>${c}</li>`).join("")}
</ul>

<h4>Sugestão:</h4>
<ul>
${analisarConsumo(nivel).sugestao.map(s => `<li>${s}</li>`).join("")}
</ul>
`}
</div>
`).join("")}

</div>
</div>


<div class="container-relatorioN">
<h2>Cobertura de Estoque (dias)</h2>
<br>
<div class="container-coluna">

${['Bom','Medio','Ruim'].map(nivel => `
<div class="coluna" style="box-shadow: 0 1px 3px ${corNivel(nivel)}">
<h2>${nivel}</h2>

<div class="separar-local">
${coberturaNivel[nivel].map(p => `
<p><span>${p.nome}</span><span>${p.coberturaE.toFixed(0)}</span></p>
`).join("")}
</div>

${coberturaNivel[nivel].length === 0 
? "<p>Não há produtos nessa classificação</p>"
: `
<h4>Causas:</h4>
<ul>
${analisarCobertura(nivel).causa.map(c => `<li>${c}</li>`).join("")}
</ul>

<h4>Sugestão:</h4>
<ul>
${analisarCobertura(nivel).sugestao.map(s => `<li>${s}</li>`).join("")}
</ul>
`}
</div>
`).join("")}

</div>
</div>


<div class="container-relatorioN">
<h2>Ruptura de Estoque (%)</h2>
<br>
<div class="container-coluna">

${['Bom','Medio','Ruim'].map(nivel => `
<div class="coluna" style="box-shadow: 0 1px 3px ${corNivel(nivel)}">
<h2>${nivel}</h2>

<div class="separar-local">
${rupturaNivel[nivel].map(p => `
<p><span>${p.nome}</span><span>${p.rupturaE.toFixed(0)}%</span></p>
`).join("")}
</div>

${rupturaNivel[nivel].length === 0 
? "<p>Não há produtos nessa classificação</p>"
: `
<h4>Causas:</h4>
<ul>
${analisarRuptura(nivel).causa.map(c => `<li>${c}</li>`).join("")}
</ul>

<h4>Sugestão:</h4>
<ul>
${analisarRuptura(nivel).sugestao.map(s => `<li>${s}</li>`).join("")}
</ul>
`}
</div>
`).join("")}

</div>
</div>
`;
    gerarRelatorio.appendChild(relatorio);
}


window.addEventListener("load", carregarDados);      calcularRuptura(p).toFixed(1) + "%",
      p.periodo
    ];
  });

  // Define os cabeçalhos
  const cabecalho = ["Produto", "Estoque fisico", "Estoque virtual", "Total de vendas", "Total de pedidos", "Giro", "Consumo médio", "Cobertura", "Ruptura", "Periodo"];

  // Adiciona a tabela
  doc.autoTable({
    head: [cabecalho],
    body: dados,
    startY: 20, // Começa abaixo do título
    theme: 'grid',
       headStyles: { fillColor: [20, 20, 20], textColor: 255 },
       
       columnStyles: {
    
    0: { cellWidth: 17 }, // Produto
    1: { cellWidth: 20 }, // Estoque físico
    2: { cellWidth: 20 }, // Estoque virtual
    3: { cellWidth: 20 }, // Total de vendas
    4: { cellWidth: 20 }, // Total de pedidos
    5: { cellWidth: 15 }, // Giro
    6: { cellWidth: 20 }, // Consumo médio
    7: { cellWidth: 20 }, // Cobertura
    8: { cellWidth: 20 }, // Ruptura
    9: { cellWidth: 16 }  //
       },
didParseCell: function (data) {


  if (data.section === "body") {

    const produto = produtos[data.row.index];

    // Giro
    if (data.column.index === 5) {
      const giro = calcularGiro(produto);
      const nivel = nivelGiroDeEstoque(giro);
      data.cell.styles.fillColor = corNivel(nivel);
    }
        if (data.column.index === 6) {
const consumo = calcularConsumoMedio(produto);
      const nivel = nivelDeConsumoM(produto, consumo);
      data.cell.styles.fillColor = corNivel(nivel);
    }

    // Cobertura
    if (data.column.index === 7) {
      const cobertura = calcularCobertura(produto);
      const nivel = nivelCobertura(produto, cobertura);
      data.cell.styles.fillColor = corNivel(nivel);
    }

    // Ruptura
    if (data.column.index === 8) {
      const ruptura = calcularRuptura(produto);
      const nivel = nivelRuptura(produto, ruptura);
      data.cell.styles.fillColor = corNivel(nivel);
    }

  }

}  
    

  });
  doc.save("relatorio-estoque.pdf");
}

//amarzena os valores dos inputs
function armazenarvalor() {
    const produto = {
        produto:
        document.getElementById('nomeDoProdutoPricipal').value,
        estoqueFisico:
        Number(document.getElementById('estoqueFisico').value),
        estoqueVirtual:
        Number(document.getElementById('estoqueVirtual').value),
        vendaTotal:
        Number(document.getElementById('vendaTotal').value),
        tempoRepo:
        Number(document.getElementById('tempoRepo').value),
        totalPedidos:
        Number(document.getElementById('totalDePedidos').value),
        periodo: document.getElementById('periodo').value
    };
    if (!produto.produto || produto.estoqueFisico < 0 || produto.estoqueVirtual < 0 || produto.vendaTotal < 0 || produto.tempoRepo < 0 || produto.totalPedidos <= 0) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }



    produtos.push(produto);
    salvarLocalStorage();
    mostrarTabela();
document.getElementById("informacoes").reset();
}

// amarzenar e definir os niveis do valor dos indicadores:

//Giro de estoque
function calcularGiro(item) {
    return item.vendaTotal / ((item.estoqueFisico + item.estoqueVirtual) / 2);
}
function analizargiro(analize) {
    const analizeNivel = {
        "Bom": {
            causa: ["Estoque adequado",
                " boa rotatividade"],
            sugestao: ["Manter Monitoramento regular"]
        },

        "Medio": {
            causa: ["Possiveis falhas na reposiçao",
                " validade ultrapassada",
                "Lesão de produto"],
            sugestao: ["Manter Monitoramento regular"]
        },

        "Ruim": {
            causa: ["Baixa demanda",
                " Estoque parado",
                " Produto avariado ou vencido"],
            sugestao: ["Realizar inventario",
                " Redefinir tempo de reposição"]
        },

    };
    return analizeNivel[analize];
}
function nivelGiroDeEstoque(giro) {
    if (giro >= 3) return "Bom";
    if (giro >= 1.6) return "Medio";
    return "Ruim";

}

//Connsumo Medio
// Cobertura de estoque = estoque total / consumo médio diário
function calcularConsumoMedio(item) {

    let dias;

    if (item.periodo === "Dia") {
        dias = 1;
    } else if (item.periodo === "Mes") {
        dias = 30;
    } else if (item.periodo === "Ano") {
        dias = 365;
    }
    if (!item.vendaTotal || item.vendaTotal === 0) return 0;
    return item.vendaTotal/dias;

}
function nivelDeConsumoM(item, consumoM) {

    const estoqueTotal = item.estoqueFisico + item.estoqueVirtual;

    if (consumoM === 0) return "Ruim";

    const cobertura = estoqueTotal / consumoM;

    if (cobertura <= 30) return "Bom";
    if (cobertura <= 60) return "Medio";
    return "Ruim";
}
function analisarConsumo(nivel) {
    const analizeNivel = {
        "Bom": {
            causa: ["Consumo compatível com o estoque"],
            sugestao: ["Manter monitoramento"]
        },
        "Medio": {
            causa: ["Possível aumento de demanda"],
            sugestao: ["Avaliar reposição"]
        },
        "Ruim": {
            causa: ["Risco de ruptura",
                ],
            sugestao: ["Rever política de estoque"]
        }
    };
    return analizeNivel[nivel];
}

//Cobertura de estoque
function calcularCobertura(item) {
    const consumoMedio = calcularConsumoMedio(item);
    if (consumoMedio === 0) return 0;

    return (item.estoqueFisico + item.estoqueVirtual) / consumoMedio;
}
function nivelCobertura(item, cobertura) {
    if (cobertura >= item.tempoRepo) return "Bom";
    if (cobertura >= item.tempoRepo * 0.5) return "Medio";
    return "Ruim";
}
function analisarCobertura(nivel){
    const analise = {
        "Bom":{
            causa:["Estoque suficiente para atender a demanda"],
            sugestao:["Manter política de reposição atual"]
        },
        "Medio":{
            causa:["Cobertura próxima do limite"],
            sugestao:["Monitorar reposição e vendas"]
        },
        "Ruim":{
            causa:["Risco de ruptura de estoque"],
            sugestao:["Aumentar estoque de segurança"]
        }
    };
    return analise[nivel];
}

//Ruptura de estoque
function calcularRuptura(item) {
            let faltou = item.totalPedidos - item.vendaTotal;


        if (faltou < 0) {
            faltou = 0;
        }


        const indiceDeRuptura = (faltou /item.totalPedidos) * 100;
        
    return indiceDeRuptura;
    
}
function nivelRuptura(item, ruptura) {
    if (ruptura <= 10) return "Bom";
    if (ruptura <= 30) return "Medio";
    return "Ruim";
}
function analisarRuptura(nivel){
    const analise = {
        "Bom":{
            causa:["Estoque suficiente para atender a demanda, boa rotatividade"],
            sugestao:["Manter política de reposição atual"]
        },
        "Medio":{
            causa:["Atraso de fornecedor", "Atraso de reposição"],
            sugestao:["Monitorar reposição e vendas"]
        },
        "Ruim":{
            causa:["Previsão de demanda imprecisa",
"Atraso de fornecedor", "Estoque de segurança insuficiente"],
            sugestao:["Revisar ponto de reposição", 
"Ajustar estoque de segurança"]
        }
    };
    return analise[nivel];
}



//faaz os calculos e a tabela
function mostrarTabela() {


    const grafico =
    document.getElementById('graficos');
    grafico.innerHTML = "";


        if (produtos.length === 0) {
const barra =
document.createElement("div");
barra.classList.add("linha");
barra.innerHTML="<p>Não há produtos</p>"

grafico.appendChild(barra);

        }


    produtos.forEach((item, index)=> {
        const produt = item.produto;



        const giroDeEstoque = calcularGiro(item);



        const indiceDeRuptura = calcularRuptura(item);

        const consumoMedio = calcularConsumoMedio(item);
        
        const coberturaDeEstoque = calcularCobertura(item);


        console.log("Giro de Estoque:", giroDeEstoque.toFixed(0));
        console.log("Cobertura de Estoque (dias):", coberturaDeEstoque.toFixed(0));
        console.log("Índice de Ruptura (%):", indiceDeRuptura.toFixed(1), "%");

        const larguraBarra = Math.min(coberturaDeEstoque, 100);





        const barra = document.createElement("div");
        barra.classList.add("linha");

        const preenchimento = document.createElement("div");
        preenchimento.classList.add("preenchimentop");
        preenchimento.innerHTML = `
        <p>${produt}</p>
        <p>${giroDeEstoque.toFixed(1)}</p>
        <p>${consumoMedio.toFixed(2)}</p>
        <p>${coberturaDeEstoque.toFixed(0)}</p>
        <p>${indiceDeRuptura.toFixed(1)}%</p>
        <button class="editar" onclick="editar(${index})">Editar</button>
        <button class="excluir" onclick="excluirItem(${index})">Excluir</button>


        `;

        barra.appendChild(preenchimento);
        grafico.appendChild(barra);
    });
    gerarGraficoGiro();
    gerarGraficoConsumo();
    gerarGraficoCbertura();
    gerarGraficoRuptura();
    filtrarTabela();
}
function filtrarTabela(){


const filtro =
document.getElementById("pesquisa-produto")
.value.toLowerCase()

const linhas =
document.querySelectorAll("#graficos .linha")

linhas.forEach(linha => {
    const resultado =
    linha.textContent.toLowerCase()
linha.className = "linha"


if(resultado.includes(filtro)){
linha.style.display=""
}else
{
linha.style.display = "none"

    
}
})

console.log(document.querySelectorAll(".linha"))

}
function mostrarIndicador(indicador) {
    // Pega todas as linhas, inclusive o header
    const linhas = document.querySelectorAll("#header-graficos .linha, #graficos .linha");
    
    
const headerColunas = document.querySelectorAll("#header-graficos .linha p");
headerColunas.forEach((col, i) => {
    col.style.display = (indicador === "todos" || i === 0 || i === indicador) ? "" : "none";
});


    linhas.forEach(linha => {
        // Pega os filhos da linha (colunas)
        const colunas = linha.children[0].children || linha.children; // no header ou preenchimento

        for (let i = 0; i < colunas.length; i++) {
            if (indicador === "todos" || i === 0 || i === indicador) {
                colunas[i].style.display = "";
            } else {
                colunas[i].style.display = "none";
            }
        }
    });
  document.querySelectorAll('.botao-filtro').forEach(b => b.classList.remove('ativo'));
const botaoAtivo = Array.from(document.querySelectorAll('.botao-filtro'))
    .find(b => b.getAttribute('onclick').includes(`mostrarIndicador(${indicador})`));
if (botaoAtivo) botaoAtivo.classList.add('ativo');
}
//Excluir o item unico
function excluirItem(index) {
    produtos.splice(index,
        1);
    salvarLocalStorage();
    mostrarTabela();
}
//botao de Excluir calculo
const abrirformapagartudo =
document.getElementById('apagarTudo');
const formapagar =
document.getElementById('form-excluir');
const apagarTudo =
document.querySelector('.confirmar');
const cancelar =
document.querySelector('.cancelar');

abrirformapagartudo.addEventListener("click", () => {
    formapagar.style.display = "block";
});
apagarTudo.addEventListener("click", () => {
    produtos.length = 0;
    salvarLocalStorage();
    mostrarTabela();
    formapagar.style.display = "none";
});
cancelar.addEventListener("click", () => {
    formapagar.style.display = "none";
})

//grafico de Giro de Estoque
function gerarGraficoGiro() {
    const canvas = document.getElementById("graficoGiro");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0,
        0,
        canvas.width,
        canvas.height);

    const valores = produtos.map(p =>
        p.vendaTotal / ((p.estoqueFisico + p.estoqueVirtual) / 2)
    );

    const max = Math.max(...valores,
        1);
    const larguraBarra = 40;
    const gap = 20;
    const margem = 30;
    canvas.width = margem + produtos.length * (larguraBarra + gap) + 100;
    canvas.height = 300;

    valores.forEach((valor, i) => {
        const altura = (valor / max) * 200;
        let corTexto;

        if (valor >= 3) {
            ctx.strokeStyle = "#80ffa2";
            ctx.fillStyle = "rgba(128, 255, 162, 0.3)";
            corTexto = "#080";
        } else if (valor >= 1.6) {
            ctx.strokeStyle = "orange";
            ctx.fillStyle = "rgba(255, 165, 0, 0.3)";
            corTexto = "#e65c00";
        } else {
            ctx.strokeStyle = "red";
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            corTexto = "#c00";
        }
        const x = 50 + i * (larguraBarra + gap);
        ctx.lineWidth = 2;
        ctx.strokeRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        )
        ctx.fillRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        );
        const ytopo = 250 - altura;
        ctx.textAlign = "center";
        ctx.fillStyle = corTexto;
        ctx.fillText(valor.toFixed(0), x + larguraBarra/2, ytopo-5);

        ctx.fillStyle = "#fff";
        ctx.fillText(produtos[i].produto, x + larguraBarra/2, 270);
    });
}

//grafico de Consumo
function gerarGraficoConsumo() {

    const canvas =
    document.getElementById("graficoConsumo");
    const ctx = canvas.getContext("2d");


    ctx.clearRect(0,
        0,
        canvas.width,
        canvas.height);

    const valores = produtos.map(p => {


const valorConsumo = 
calcularConsumoMedio(p);

        return valorConsumo;
    }
    );

    const max = Math.max(...valores,
        1);

    const larguraBarra = 40;
    const gap = 20;

    const margem = 30;
    canvas.width = margem + produtos.length * (larguraBarra + gap) + 100;
    canvas.height = 300;
    valores.forEach((valor, i) => {
        const item = produtos[i];
        const altura = (valor / max) * 200;
        let corTexto;
const nivel = nivelDeConsumoM(item, valor);

if (nivel === "Bom") {
    ctx.strokeStyle = "#80ffa2";
    ctx.fillStyle = "rgba(128, 255, 162, 0.3)";
    corTexto = "#080";
}
else if (nivel === "Medio") {
    ctx.strokeStyle = "orange";
    ctx.fillStyle = "rgba(255, 165, 0, 0.3)";
    corTexto = "#e65c00";
}
else {
    ctx.strokeStyle = "red";
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    corTexto = "#c00";
}
        const x = 50 + i * (larguraBarra + gap);
        ctx.lineWidth = 2;
        ctx.strokeRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        )
        ctx.fillRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        );
        const ytopo = 250 - altura;
        ctx.textAlign = "center";
        ctx.fillStyle = corTexto;
        ctx.fillText(valor.toFixed(0), x + larguraBarra/2, ytopo-5);

        ctx.fillStyle = "#fff";
        ctx.fillText(produtos[i].produto, x + larguraBarra/2, 270);


    });
}

//grafico de Cobretura
function gerarGraficoCbertura() {
    const canvas =
    document.getElementById("graficoCobertura");
    const ctx = canvas.getContext("2d");


    ctx.clearRect(0,
        0,
        canvas.width,
        canvas.height);

    const valores = produtos.map(p => {


        const coberturaDeEstoque = calcularCobertura(p);
        return coberturaDeEstoque;

    });


    const max = Math.max(...valores,
        1);

    const larguraBarra = 40;
    const gap = 20;

    const margem = 30;
    canvas.width = margem + produtos.length * (larguraBarra + gap) + 100;
    canvas.height = 300;
    valores.forEach((valor, i) => {
        const item = produtos[i];
        const altura = (valor / max) * 200;
        let dias = 1;
        if (item.periodo === "mes") dias = 30;
        else if (item.periodo === "Ano") dias = 365;
        let corTexto;
        const cobertura = calcularCobertura(item);

        if (cobertura >= item.tempoRepo) {
            ctx.strokeStyle = "#80ffa2";
            ctx.fillStyle = "rgba(128, 255, 162, 0.3)";
            corTexto = "#080";
        } else if (cobertura >= item.tempoRepo *0.5) {
            ctx.strokeStyle = "orange";
            ctx.fillStyle = "rgba(255, 165, 0, 0.3)";
            corTexto = "#e65c00";
        } else {
            ctx.strokeStyle = "red";
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            corTexto = "#c00";
        }




        const x = 50 + i * (larguraBarra + gap);
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 250 - altura, larguraBarra, altura);
        ctx.fillRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        );
        const ytopo = 250 - altura;
        ctx.textAlign = "center";
        ctx.fillStyle = corTexto;
        ctx.fillText(valor.toFixed(0), x + larguraBarra/2, ytopo-5);

        ctx.fillStyle = "#fff";
        ctx.fillText(produtos[i].produto, x+ larguraBarra/2, 270);


    });
}

//grafico de Ruptura
function gerarGraficoRuptura() {
    const canvas = document.getElementById("graficoRuptura");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0,
        0,
        canvas.width,
        canvas.height);

    const valores = produtos.map(p => {

const valorRuptura = calcularRuptura(p);
        return valorRuptura;
        
    });

    const max = 100;
    const larguraBarra = 40;
    const gap = 20;
    const margem = 30;
    canvas.width = margem + produtos.length * (larguraBarra + gap) + 100;
    canvas.height = 300;

    // 2. Desenha a escala lateral
    ctx.fillStyle = "#fff";
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
        // 0%, 20%, 40%, 60%, 80%, 100%
        const y = 250 - (i / 5) * 200;
        ctx.fillText((i * 20) + "%", 40, y + 5);
        // +5 pra alinhar verticalmente
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(45, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    valores.forEach((valor, i) => {
        const altura = (valor / max) * 200;
        let corTexto;

        if (valor <= 10) {
            ctx.strokeStyle = "#80ffa2";
            ctx.fillStyle = "rgba(128, 255, 162, 0.3)";
            corTexto = "#080";
        } else if (valor <= 30) {
            ctx.strokeStyle = "orange";
            ctx.fillStyle = "rgba(255, 165, 0, 0.3)";
            corTexto = "#e65c00";
        } else {
            ctx.strokeStyle = "red";
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            corTexto = "#c00";
        }
        const x = 50 + i * (larguraBarra + gap);
        ctx.lineWidth = 2;
        ctx.strokeRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        )
        ctx.fillRect(
            x,
            250 - altura,
            larguraBarra,
            altura
        );
        const ytopo = 250 - altura;
        ctx.textAlign = "center";
        ctx.fillStyle = corTexto;
        ctx.fillText(valor.toFixed(0)+ "%", x + larguraBarra/2, ytopo-5);

        ctx.fillStyle = "#fff";
        ctx.fillText(produtos[i].produto, x + larguraBarra/2, 270);
    });
}

// salvar alterações no navegador
function salvarLocalStorage() {
    localStorage.setItem("produtos",
        JSON.stringify(produtos));
}

//carrega os dados no navegador
function carregarDados() {
    const dados =
    localStorage.getItem("produtos");
    if (dados) {
        produtos.length = 0;
        produtos.push(...JSON.parse(dados));
        mostrarTabela();
    }
}
let indexEdicao = null;

//editar valor do calculo ou ver ele
function editar(index) {
    indexEdicao = index;
    document.getElementById('editarFor').style.display = "block";

    document.getElementById('noproduto').value = produtos[index].produto;

    document.getElementById('esFisico').value =
    produtos[index].estoqueFisico;

    document.getElementById('esvirtual').value = produtos[index].estoqueVirtual;

    document.getElementById('TotalDevendas').value =
    produtos[index].vendaTotal;

    document.getElementById('tempo').value =
    produtos[index].tempoRepo;

    document.getElementById('totalPedido').value =
    produtos[index].totalPedidos;
}
//salvar editagem no valor pra ser calculado
function salvarEdicao() {
    if (indexEdicao === null)return;
    const p = produtos[indexEdicao];
    p.produto =
    document.getElementById('noproduto').value;
    p.estoqueFisico =
    Number(document.getElementById('esFisico').value);
    p.estoqueVirtual =
    Number(document.getElementById('esvirtual').value);
    p.vendaTotal =
    Number(document.getElementById('TotalDevendas').value);
    p.tempoRepo =
    Number(document.getElementById('tempo').value);
    p.totalPedidos =
    Number(document.getElementById('totalPedido').value);
    salvarLocalStorage();
    mostrarTabela();
    document.getElementById('editarFor').style.display = "none";

}
//fechar o formulario de editar se mudar o valor
function voltar() {
    document.getElementById('editarFor').style.display = "none";

}

//Cores dos niveis
function corNivel(nivel) {
    const cores = {
        "Bom": "#4a7c59",
        "Medio": "#c68c3f",
        "Ruim": "#FF6347"
    };
    return cores[nivel] || "#fff";

}

function mostrarRelatorio() {
    const gerarRelatorio =
    document.getElementById('relatorio');
    gerarRelatorio.innerHTML = "";

    const giroNivel = {
        Bom: [],
        Medio: [],
        Ruim: []
    };
    const consumoNivel = {
        Bom: [],
        Medio: [],
        Ruim: []
    };
    const coberturaNivel = {
        Bom: [],
        Medio: [],
        Ruim: []
    }
    const rupturaNivel = {
        Bom: [],
        Medio: [],
        Ruim: []
    }



    produtos.forEach(p => {
        const giro = calcularGiro(p);
        const consumoM = calcularConsumoMedio(p);
      const coberturaE = calcularCobertura(p);
      const rupturaE = calcularRuptura(p);
        const nivelCM =
        nivelDeConsumoM(p, consumoM);
        consumoNivel[nivelCM].push({
            nome: p.produto,
            consumoM: consumoM
        });

        const nivelG =
        nivelGiroDeEstoque(giro);
        giroNivel[nivelG].push({
            nome: p.produto,
            giro: giro
        });
        
                const nivelCo =
        nivelCobertura(p, coberturaE);
        
        coberturaNivel[nivelCo].push({
            nome: p.produto,
            coberturaE: coberturaE
        });
        const nivelRup=
        nivelRuptura(p,rupturaE);
        rupturaNivel[nivelRup].push({
            nome: p.produto,
            rupturaE: rupturaE
        });
        
    });


    const relatorio =
    document.createElement('div');
    relatorio.className = "relatorio";

    relatorio.innerHTML =
    `
       <br>
 
    <h1>Relatório</h1>
    <br>     
    
    <div class="container-relatorioN">
    <h2>Giro de estoque</h2>
    <br>
    <div class= "container-coluna">
    <div class= "coluna"  style=" box-shadow: 0 1px 4px${corNivel('Bom')}">
    <h2>Bom</h2>
    <div class= "separar-local">

    ${giroNivel.Bom.map(p => ` <p>        <span>
${p.nome}        </span>
        <span>
${p.giro.toFixed(2)}        </span>
</p>`).join("")}
    </div>


    <h4>Causas:</h4>
    <ul>
    ${analizargiro('Bom').causa.map(c => `<li>${c}</li>`).join("")}

    </ul>
    <h4>sugestão:</h4>
    <ul>
    ${analizargiro('Bom').sugestao.map(c => `<li>${c}</li>`).join("")}

    </ul>
    </div>
    <div class= "coluna" style=" box-shadow: 0 1px 4px${corNivel('Medio')}">

    <h2>Medio</h2>
    <div class= "separar-local">

    ${giroNivel.Medio.map(p => ` <p>        <span>
${p.nome}        </span>
        <span>
${p.giro.toFixed(2)}        </span>
</p>`).join("")}

    </div>

    <h4>Causas:</h4>
    <ul>
    ${analizargiro('Medio').causa.map(c => `<li>${c}</li>`).join("")}

    </ul>

    <h4>sugestão:</h4>
    <ul>
    ${analizargiro('Medio').sugestao.map(c => `<li>${c}</li>`).join("")}
    </ul>
    </div>

    <div class= "coluna" style=" box-shadow: 0 1px 4px${corNivel('Ruim')}">

    <h2>Ruim</h2>
    <div class= "separar-local">

    ${giroNivel.Ruim.map(p => ` <p>        <span>
${p.nome}         </span>
        <span>
  ${p.giro.toFixed(2)}        </span>
</p>`).join("")}
    </div>

    <h4>Causas:</h4>
    <ul>
    ${analizargiro('Ruim').causa.map(c => `<li>${c}</li>`).join("")}
    </ul>

    <h4>sugestão:</h4>
    <ul>
    ${analizargiro('Ruim').sugestao.map(c => `<li>${c}</li>`).join("")}
    </ul>
    </div>

    </div>    </div>

        <div class="container-relatorioN">

    <h2>Consumo Medio</h2>
    <br>
    <div class= "container-coluna">
    <div class= "coluna"  style=" box-shadow: 0 1px 3px${corNivel('Bom')}">
    <h2>Bom</h2>    <div class= "separar-local">

    ${consumoNivel.Bom.map(p => ` <p>        <span>
${p.nome}        </span>
        <span>
${p.consumoM.toFixed(1)}        </span>
</p>`).join("")}

    </div>

    <h4>Causas:</h4>
    <ul>
    ${analisarConsumo('Bom').causa.map(c => `<li>${c}</li>`).join("")}    </ul>
    <h4>sugestão:</h4>
    <ul>
    ${analisarConsumo('Bom').sugestao.map(c => `<li>${c}</li>`).join("")}    </ul>
    </div>
    <div class= "coluna" style=" box-shadow: 0 1px 3px${corNivel('Medio')}">

    <h2>Medio</h2>
    <div class= "separar-local">

    ${consumoNivel.Medio.map(p => ` <p>        <span>
${p.nome}        </span>
        <span>
${p.consumoM.toFixed(1)}</span></p>`).join("")}

    </div>

    <h4>Causas:</h4>
    <ul>
    ${analisarConsumo('Medio').causa.map(c => `<li>${c}</li>`).join("")}
    </ul>

    <h4>sugestão:</h4>
    <ul>
    ${analisarConsumo('Medio').sugestao.map(c => `<li>${c}</li>`).join("")}
    </ul>
    </div>

    <div class= "coluna" style=" box-shadow: 0 1px 4px${corNivel('Ruim')}">

    <h2>Ruim</h2>
    <div class= "separar-local">
    ${consumoNivel.Ruim.map(p => ` <p>        <span>${p.nome}</span><span>${p.consumoM.toFixed(0)}</span></p>`).join("")}
    </div>

    <h4>Causas:</h4>
    <ul>
    ${analisarConsumo('Ruim').causa.map(c => `<li>${c}</li>`).join("")}
    </ul>

    <h4>sugestão:</h4>
    <ul>
    ${analisarConsumo('Ruim').sugestao.map(c => `<li>${c}</li>`).join("")}
    </ul>
    </div>

    </div> 
        </div>

    <div class="container-relatorioN">
        <br>
    <h2>Cobertura de Estoque(em dias)</h2>
    <div class= "container-coluna">
    <div class= "coluna"  style=" box-shadow: 0 1px 3px${corNivel('Bom')}">
    <h2>Bom</h2>    <div class= "separar-local">

    ${coberturaNivel.Bom.map(p => ` <p>        <span>${p.nome}</span><span>${p.coberturaE.toFixed(0)}</span></p>`).join("")}

    </div>

    <h4>Causas:</h4>
    <ul>
    ${analisarCobertura('Bom').causa.map(c => `<li>${c}</li>`).join("")}    </ul>
    <h4>sugestão:</h4>
    <ul>
    ${analisarCobertura('Bom').sugestao.map(c => `<li>${c}</li>`).join("")}    </ul>
    </div>
    <div class= "coluna" style=" box-shadow: 0 1px 3px${corNivel('Medio')}">

    <h2>Medio</h2>
    <div class= "separar-local">

    ${coberturaNivel.Medio.map(p => ` <p>        <span>${p.nome}</span><span>${p.coberturaE.toFixed(0)}</span> </p>`).join("")}

    </div>

    <h4>Causas:</h4>
    <ul>
    ${analisarCobertura('Medio').causa.map(c => `<li>${c}</li>`).join("")}
    </ul>

    <h4>sugestão:</h4>
    <ul>
    ${analisarCobertura('Medio').sugestao.map(c => `<li>${c}</li>`).join("")}
    </ul>
    </div>

    <div class= "coluna" style=" box-shadow: 0 1px 4px${corNivel('Ruim')}">

    <h2>Ruim</h2>
    <div class= "separar-local">
    ${coberturaNivel.Ruim.map(p => ` <p>        <span>${p.nome}</span><span>${p.coberturaE.toFixed(1)}</span> </p>`).join("")}
    </div>

    <h4>Causas:</h4>
    <ul>
    ${analisarCobertura('Ruim').causa.map(c => `<li>${c}</li>`).join("")}
    </ul>

    <h4>sugestão:</h4>
    <ul>
    ${analisarCobertura('Ruim').sugestao.map(c => `<li>${c}</li>`).join("")}
    </ul>
    </div>

    </div>
    </div>

        <div class="container-relatorioN">
    <h2>Ruptura de Estoque(%)</h2>
        <br>
    <div class= "container-coluna">
    <div class= "coluna"  style=" box-shadow: 0 1px 3px${corNivel('Bom')}">
    <h2>Bom</h2>    <div class= "separar-local">

    ${rupturaNivel.Bom.map(p => ` <p>        <span>
${p.nome}</span><span>${p.rupturaE.toFixed(0)}%</span> </p>`).join("")}

    </div>

    <h4>Causas:</h4>
    <ul>
    ${analisarRuptura('Bom').causa.map(c => `<li>${c}</li>`).join("")}    </ul>
    <h4>sugestão:</h4>
    <ul>
    ${analisarRuptura('Bom').sugestao.map(c => `<li>${c}</li>`).join("")}    </ul>
    </div>
    <div class= "coluna" style=" box-shadow: 0 1px 3px${corNivel('Medio')}">

    <h2>Medio</h2>
    <div class= "separar-local">

    ${rupturaNivel.Medio.map(p => ` <p>
        <span>${p.nome}</span> <span>${p.rupturaE.toFixed(0)}%</span> 
</p>`).join("")}

    </div>

    <h4>Causas:</h4>
    <ul>
    ${analisarRuptura('Medio').causa.map(c => `<li>${c}</li>`).join("")}
    </ul>

    <h4>sugestão:</h4>
    <ul>
    ${analisarRuptura('Medio').sugestao.map(c => `<li>${c}</li>`).join("")}
    </ul>
    </div>

    <div class= "coluna" style=" box-shadow: 0 1px 4px${corNivel('Ruim')}">

    <h2>Ruim</h2>
    <div class= "separar-local">
    ${rupturaNivel.Ruim.map(p => ` <p>        <span>${p.nome}</span><span>${p.rupturaE.toFixed(1)}%</span> </p>`).join("")}
    </div>

    <h4>Causas:</h4>
    <ul>
    ${analisarRuptura('Ruim').causa.map(c => `<li>${c}</li>`).join("")}
    </ul>

    <h4>sugestão:</h4>
    <ul>
    ${analisarRuptura('Ruim').sugestao.map(c => `<li>${c}</li>`).join("")}
    </ul>
    </div>

    </div>
    </div>



    `;

    gerarRelatorio.appendChild(relatorio);
}


window.addEventListener("load", carregarDados);
