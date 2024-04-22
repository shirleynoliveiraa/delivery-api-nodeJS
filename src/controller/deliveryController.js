import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

export async function createOrder (req, res, next) {
  try {
    let pedido = req.body;

    if (!pedido.cliente || !pedido.produto || !pedido.valor) {
      throw new Error("Cliente, Produto e Valor are required.");
    }

    const data = JSON.parse(await readFile(fileName));

    pedido = {
      id: data.nextId++,
      cliente: pedido.cliente,
      produto: pedido.produto,
      valor: pedido.valor,
      entregue: pedido.entregue = false,
      timestamp: pedido.timestamp = new Date()
    }

    data.pedidos.push(pedido);

    await writeFile(fileName, JSON.stringify(data, null, 2));

    res.send(pedido);

    logger.info(`POST /delivery - ${JSON.stringify(pedido)}`);
  } catch (error) {
    next(error);
  }
}

export async function getOrders (req, res, next) {
  try {
    const data = JSON.parse(await readFile(fileName));
    delete(data.nextId);

    res.send(data);

    logger.info("GET /pedidos");
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
}

export async function getOrdersById (req, res, next) {
  try {
    const data = JSON.parse(await readFile(fileName));

    const order = data.pedidos.find(
      order => order.id === parseInt(req.params.id)
    );

    res.send(order);

    logger.info("GET /pedidos/:id");
  } catch (error) {
    next(error);
  }
}

export async function updateOrder (req, res, next) {
  try {
    const order = req.body;

    if (!order.id || !order.cliente || !order.produto || !order.valor || !order.entregue) {
      throw new Error("Cliente, Produto e Valor are required.");
    }

    const data = JSON.parse(await readFile(fileName));
    const index = data.pedidos.findIndex(o => o.id === parseInt(order.id));
  
    if (data.pedidos[index].produto == order.produto) {
      data.pedidos[index].cliente = order.cliente;
      data.pedidos[index].valor = order.valor;
      data.pedidos[index].entregue = order.entregue;

      await writeFile(fileName, JSON.stringify(data, null, 2));
      res.send(order);
      logger.info(`POST /delivery - ${JSON.stringify(order)}`);
    } else {
      throw new Error(`Produto ${order.produto} inexistente no pedido ${order.id}`);
    }
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus (req, res, next) {
  try {
    let order = req.body;

    const data = JSON.parse(await readFile(fileName));
    const index = data.pedidos.findIndex(o => o.id === order.id);

    if (index === -1) {
      throw new Error("Register not found");
    }

    data.pedidos[index].entregue = order.entregue;

    await writeFile(fileName, JSON.stringify(data, null, 2));

    res.send(data.pedidos[index]);

    logger.info(`PATCH /delivery/updateOrderStatus - ${JSON.stringify(order)}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteOrder (req, res, next) {
  try {
    const data = JSON.parse(await readFile(fileName));

    data.pedidos = data.pedidos.filter(
      pedido => pedido.id !== parseInt(req.params.id)
    );

    await writeFile(fileName, JSON.stringify(data, null, 2));

    res.end();
    logger.info(`DELETE /pedido/:id - ${req.params.id}`);
  } catch (error) {
    next(error);
  }
}

export async function totalOrderByClient(req, res, next) {
  try {
    const { clientName } = req.params;

    const data = JSON.parse(await readFile(fileName));
    const order = data.pedidos.find(order => order.cliente === clientName);

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    const count = data.pedidos.filter(item => item.cliente === clientName && item.entregue);
    const total = count.reduce((total, item) => total + item.valor, 0);

    res.json({ total });

    logger.info(`GET /client/${clientName}/totalOrder`);
  } catch (error) {
    next(error);
  }
}

export async function mostSoldProducts(req, res, next) {
  try {
    const data = JSON.parse(await readFile(fileName));

    // Filtra os pedidos que foram entregues
    const deliveredOrders = data.pedidos.filter(order => order.entregue);

    // Conta a quantidade de vezes que cada produto foi pedido
    const productsCount = deliveredOrders.reduce((countMap, order) => {
      const productName = order.produto;
      countMap[productName] = (countMap[productName] || 0) + 1;
      return countMap;
    }, {});

    // Ordena os produtos com base na quantidade de pedidos em ordem decrescente
    const sortedProducts = Object.entries(productsCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([productName, count]) => `${productName} - ${count}`);

    // Retorna os produtos formatados como resposta do endpoint
    res.json(sortedProducts);

    logger.info("GET /mostSoldProducts");
  } catch (error) {
    next(error);
  }
}

export async function totalOrdersByProduct(req, res, next) {
  try {
    const data = JSON.parse(await readFile(fileName));
    const orders = data.pedidos.filter(order => order.entregue);

    const ordersByProduct = orders.reduce((acc, order) => {
      if (!acc[order.produto]) {
        acc[order.produto] = 1;
      } else {
        acc[order.produto]++;
      }
      return acc;
    }, {});

    res.json(ordersByProduct);

    logger.info("GET /product");
  } catch (error) {
    next(error);
  }
}



export async function errorLog (error, req, res, next) {
  logger.error(`${req.method} ${req.baseUrl} - ${error.message}`);
  res.status(400).send({ error: error.message });
}