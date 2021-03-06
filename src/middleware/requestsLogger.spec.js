// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { expect } = require("chai");

const httpMocks = require("node-mocks-http");
const { decodeFromReq, isEmptyObject } = require("./requestsLogger");

describe("requestLogger", () => {
  it("decodeFromReq - Pass coded request header - Should decode request header", async () => {
    // Arrange
    const req = httpMocks.createRequest({
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJncmVldGluZ3MiOiJIZWxsbyB0aGVyZSIsImlkIjoxMjMsInZhbGlkIjp0cnVlfQ.tWYAqlrDfRliog2YPtVhsB3Zj5fvqjc4NjNhxEEgTRM"
      }
    });

    // Act
    const decodedValue = decodeFromReq(req);

    // Assert
    expect(decodedValue).to.not.be.null;
    expect(decodedValue.greetings).to.equal("Hello there");
    expect(decodedValue.id).to.equal(123);
    expect(decodedValue.valid).to.be.true;
  });

  it("isEmptyObject - Pass {} - Should return true", async () => {
    // Arrange
    const obj = {};

    // Act
    const result = isEmptyObject(obj);

    // Assert
    expect(result).to.not.be.null;
    expect(result).to.be.true;
  });

  it("isEmptyObject - Pass 'new Object()' - Should return true", async () => {
    // Arrange
    // eslint-disable-next-line no-new-object
    const obj = new Object();

    // Act
    const result = isEmptyObject(obj);

    // Assert
    expect(result).to.not.be.null;
    expect(result).to.be.true;
  });

  it("isEmptyObject - Pass 'Object' - Should return false", async () => {
    // Arrange
    const obj = "Object";

    // Act
    const result = isEmptyObject(obj);

    // Assert
    expect(result).to.not.be.null;
    expect(result).to.be.false;
  });
});
