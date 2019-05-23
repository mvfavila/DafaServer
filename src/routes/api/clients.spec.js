// required mock-require and node-mocks-http

// // During the test the env variable is set to test
// process.env.NODE_ENV = "test";

// const { use, expect, request } = require("chai");
// const chaiHttp = require("chai-http");
// const http = require("http");
// const httpMocks = require("node-mocks-http");

// use(chaiHttp);

// require("../../bin/www");
// const mock = require("mock-require");

// mock("clientController", {
//   addClient(client) {
//     return client;
//   }
// });

// const clientController = require("clientController");
// const { clientApi } = require("../../routes/api/clients");
// debugger;

// const api = clientApi(clientController);

// describe("clients API - Unit tests", () => {
//   it("getHealthCheck - Make request - Should return ok", async () => {
//     const req = httpMocks.createRequest();
//     const res = httpMocks.createResponse();
//     const result = await api.getHealthCheck(req, res);
//     debugger;
//     expect(result).to.not.be.null;
//     expect(result.statusCode).to.be.equal(
//       httpStatus.httpStatus.UNPROCESSABLE_ENTITY
//     );
//   });
// });
