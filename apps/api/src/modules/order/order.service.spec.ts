import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
  });

  describe('getOrderById', () => {
    it('should return order if found', async () => {
      const orderId = 'order123';
      const order = {
        id: orderId,
        userId: 'user123',
        agentId: 'agent123',
        amount: 100,
        status: 'pending',
        createdAt: new Date(),
      };

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(order);

      const result = await service.getOrderById(orderId);

      expect(result.id).toBe(orderId);
      expect(result.amount).toBe(100);
    });

    it('should throw NotFoundException if order not found', async () => {
      const orderId = 'order123';

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getOrderById(orderId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOrders', () => {
    it('should return orders with pagination', async () => {
      const orders = [
        {
          id: 'order1',
          userId: 'user123',
          agentId: 'agent123',
          amount: 100,
          status: 'pending',
          createdAt: new Date(),
        },
        {
          id: 'order2',
          userId: 'user123',
          agentId: 'agent123',
          amount: 200,
          status: 'completed',
          createdAt: new Date(),
        },
      ];

      (prismaService.order.findMany as jest.Mock).mockResolvedValue(orders);

      const result = await service.getOrders({ page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].amount).toBe(100);
      expect(result.data[1].amount).toBe(200);
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const orderData = {
        userId: 'user123',
        agentId: 'agent123',
        amount: 100,
        status: 'pending',
      };
      const createdOrder = {
        id: 'order123',
        ...orderData,
        createdAt: new Date(),
      };

      (prismaService.order.create as jest.Mock).mockResolvedValue(createdOrder);

      const result = await service.createOrder(orderData);

      expect(result.id).toBe('order123');
      expect(result.amount).toBe(100);
    });
  });

  describe('updateOrder', () => {
    it('should update order successfully', async () => {
      const orderId = 'order123';
      const updateData = { status: 'completed' };
      const updatedOrder = {
        id: orderId,
        userId: 'user123',
        agentId: 'agent123',
        amount: 100,
        status: 'completed',
        createdAt: new Date(),
      };

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue({ id: orderId });
      (prismaService.order.update as jest.Mock).mockResolvedValue(updatedOrder);

      const result = await service.updateOrder(orderId, updateData);

      expect(result.status).toBe('completed');
    });

    it('should throw NotFoundException if order not found', async () => {
      const orderId = 'order123';
      const updateData = { status: 'completed' };

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateOrder(orderId, updateData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      const orderId = 'order123';

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue({ id: orderId });
      (prismaService.order.delete as jest.Mock).mockResolvedValue({ id: orderId });

      const result = await service.deleteOrder(orderId);

      expect(result).toEqual({ id: orderId });
    });

    it('should throw NotFoundException if order not found', async () => {
      const orderId = 'order123';

      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteOrder(orderId)).rejects.toThrow(NotFoundException);
    });
  });
});
