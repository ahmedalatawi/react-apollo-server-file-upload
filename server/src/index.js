const { ApolloServer, gql } = require("apollo-server-express");
const { createWriteStream, existsSync, mkdirSync } = require("fs");
const path = require("path");
const express = require("express");
const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js');

const files = [];

const typeDefs = gql`
  scalar Upload

  type Query {
    files: [String]
  }

  type Mutation {
    uploadFile(file: Upload!): Boolean
  }
`;

const resolvers = {
  Query: {
    files: () => files
  },
  Mutation: {
    uploadFile: async (_, { file }) => {
      const fileObj = await file;
      const { createReadStream, filename } = fileObj.file;

      console.log(filename)

      await new Promise(res =>
        createReadStream()
          .pipe(createWriteStream(path.join(__dirname, "../images", filename)))
          .on("close", res)
      );

      files.push(filename);

      return true;
    }
  }
};

existsSync(path.join(__dirname, "../images")) || mkdirSync(path.join(__dirname, "../images"));

const startServer = async () => {
  const server = new ApolloServer({ typeDefs, resolvers, uploads: false });
  const app = express();
  app.use("/images", express.static(path.join(__dirname, "../images")));

  await server.start()
  app.use(graphqlUploadExpress());
  server.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log(`🚀  Server ready at http://localhost:4000/`);
  });

}

startServer()