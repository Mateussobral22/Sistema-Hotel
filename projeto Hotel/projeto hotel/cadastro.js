document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('formCadastro');
    const formLogin = document.getElementById('formLogin');

    // Lógica para a página de Cadastro
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(event) {
            event.preventDefault();

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            // Armazena todos os usuários em um array
            let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

            // Verifica se o email já está cadastrado
            const emailExistente = usuarios.find(u => u.email === email);
            if (emailExistente) {
                alert('Este e-mail já está cadastrado. Por favor, faça login.');
                return;
            }

            // Adiciona o novo usuário ao array
            usuarios.push({ nome: nome, email: email, senha: senha });

            // Salva o array de usuários atualizado
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            localStorage.setItem('usuarioLogado', JSON.stringify({ email: email }));

            alert('Cadastro realizado com sucesso! Redirecionando...');
            window.location.href = 'index.html'; 
        });
    }

    // Lógica para a página de Login
    if (formLogin) {
        formLogin.addEventListener('submit', function(event) {
            event.preventDefault();

            const email = document.getElementById('emailLogin').value;
            const senha = document.getElementById('senhaLogin').value;

            let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            
            // Procura o usuário no array
            const usuarioExistente = usuarios.find(u => u.email === email && u.senha === senha);

            if (usuarioExistente) {
                // Salva o usuário logado
                localStorage.setItem('usuarioLogado', JSON.stringify({ email: email }));
                alert('Login bem-sucedido! Redirecionando...');
                window.location.href = 'index.html';
            } else {
                alert('E-mail ou senha incorretos. Por favor, tente novamente.');
            }
        });
    }
});