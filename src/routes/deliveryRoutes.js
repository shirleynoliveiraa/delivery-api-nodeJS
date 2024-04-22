import express from "express";
import { createOrder, deleteOrder, errorLog, getOrders, getOrdersById, mostSoldProducts, totalOrderByClient, totalOrdersByProduct, updateOrder, updateOrderStatus } from "../controller/deliveryController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/product", totalOrdersByProduct);
router.get("/client/:clientName/totalOrder", totalOrderByClient);
router.get("/mostSoldProducts", mostSoldProducts)
router.get("/", getOrders);
router.get("/:id", getOrdersById);
router.put("/", updateOrder);
router.patch("/updateOrderStatus", updateOrderStatus);
router.delete("/:id", deleteOrder);
router.use(errorLog);

export default router;