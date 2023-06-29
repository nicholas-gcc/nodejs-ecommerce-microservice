const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();

chai.use(chaiHttp);


describe("Products", () => {
  let app;

  before(async () => {
    app = new App();
    await Promise.all([app.connectDB(), app.setupMessageBroker()])

    // Authenticate with the auth microservice to get a token
    const authRes = await chai
      .request("http://localhost:3000")
      .post("/login")
      .send({ username: process.env.LOGIN_TEST_USER, password: process.env.LOGIN_TEST_PASSWORD });

    authToken = authRes.body.token;
    console.log(authToken);
    app.start();
  });

  after(async () => {
    await app.disconnectDB();
    app.stop();
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const product = {
        name: "Product 1",
        description: "Description of Product 1",
        price: 10,
      };
      const res = await chai
        .request(app.app)
        .post("/api/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
            name: "Product 1",
            price: 10,
            description: "Description of Product 1"
          });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("name", product.name);
      expect(res.body).to.have.property("description", product.description);
      expect(res.body).to.have.property("price", product.price);
    });

    it("should return an error if name is missing", async () => {
      const product = {
        description: "Description of Product 1",
        price: 10.99,
      };
      const res = await chai
        .request(app.app)
        .post("/api/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(product);

      expect(res).to.have.status(400);
    });
  });
});

