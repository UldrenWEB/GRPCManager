import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import extractJSON from "../utils/extractJSON.js";
const config = extractJSON({ path: "../configs/grpcConfig.json" });

class GRPCServer {
  constructor({ protoBuffer, host, config }) {
    this.protoBuffer = protoBuffer;
    this.host = host;
    this.packageDefinition = null;
    this.config = config;
    this.server = new grpc.Server();
    this.#loadProtos();
  }

  #loadProtos() {
    try {
      this.packageDefinition = protoLoader.loadSync(
        this.protoBuffer,
        this.config
      );
    } catch (error) {
      console.error(
        `Hubo un error al cargar el archivo .proto ${error.message}`
      );
      throw new Error(`Error al cargar el proto`);
    }
  }

  addService(packageName, serviceName, methods) {
    const packageObject = grpc.loadPackageDefinition(this.packageDefinition)[
      packageName
    ];
    const service = packageObject[serviceName].service;
    this.server.addService(service, methods);
  }

  start() {
    this.server.bindAsync(
      this.host,
      grpc.ServerCredentials.createInsecure(),
      (err, _port) => {
        if (err) {
          throw new Error(err);
        }
        this.server.start();
      }
    );
  }
}

export default GRPCServer;
