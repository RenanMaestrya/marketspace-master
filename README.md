## ✨ Tecnologias

- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Axios](https://axios-http.com/docs/intro)
- [Prisma](https://www.prisma.io/)
- [Native Base - Component Library](https://nativebase.io/)
- [React Hook Form](https://react-hook-form.com/)

---

# Siga os passos abaixo para exercutar corretamente!

## 🚀 Como executar o Back-end

- Instale os pacotes com `npm install`.
- Execute `npm run dev` para iniciar o servidor.
- Execute `npx prisma migrate dev` para rodar as migrations.
- Execute `npx prisma db seed` para rodar as seeds.
- Caso haja problemas com o banco de dados, você pode resetar e fazer o processo de subir o banco de dados novamente. Use `npx prisma migrate reset`.

## 🚀 Como executar o Mobile
Para que esse projeto funcione corretamente, é preciso estar com o servidor rodando.

- Instale os pacotes com npm install.
- Alterar o endereço do arquivo src/services/api.ts colocando o IP da máquina.
- Execute npx expo start para iniciar o servidor do Expo.
- É preciso estar com o servidor Node inicializado para que as chamadas a API funcionem corretamente.
