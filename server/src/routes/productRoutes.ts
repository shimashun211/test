import express, { Request, Response } from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware';
import { users, notifications } from './userRoutes'; // Import users and notifications array

// Define the Product type
interface Product {
  _id: string;
  name: string;
  image: string;
  description: string;
  sellerId: string;
  sellerName: string;
  faculty: string; // New: Faculty field
  requesters: string[]; // Array of user IDs
  isSold: boolean;
  matchedUser: string | null;
}

// Define the Message type
interface Message {
  _id: string;
  productId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: Date;
}

// Dummy data for textbooks
let products: Product[] = [
  {
    _id: '1',
    name: 'React入門',
    image: '/uploads/sample.jpg',
    description: 'Reactの基礎を学ぶための本です。',
    sellerId: '0', // Dummy seller ID
    sellerName: '山田太郎',
    faculty: 'RU',
    requesters: [],
    isSold: false,
    matchedUser: null,
  },
  {
    _id: '2',
    name: '統計学の基礎',
    image: '/uploads/sample.jpg',
    description: '統計学の初歩を解説します。',
    sellerId: '0', // Dummy seller ID
    sellerName: '山田太郎',
    faculty: 'RB',
    requesters: [],
    isSold: false,
    matchedUser: null,
  },
  {
    _id: '3',
    name: 'Webデザインの教科書',
    image: '/uploads/sample.jpg',
    description: 'HTML&CSS, JavaScriptの基本を学びます。',
    sellerId: '0', // Dummy seller ID
    sellerName: '山田太郎',
    faculty: 'RD',
    requesters: [],
    isSold: false,
    matchedUser: null,
  },
];

// Dummy data for messages
let messages: Message[] = [];

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', (req: Request, res: Response) => {
  const { faculty } = req.query;
  let filteredProducts = products;

  if (faculty && typeof faculty === 'string') {
    filteredProducts = products.filter(p => p.faculty === faculty);
  }

  res.json(filteredProducts);
});

// @desc    Fetch user's own products
// @route   GET /api/products/myproducts
// @access  Private
router.get('/myproducts', protect, (req: Request, res: Response) => {
  const myProducts = products.filter(p => p.sellerId === req.user.id);
  res.json(myProducts);
});

// @desc    Fetch products where the user is matched
// @route   GET /api/products/matched
// @access  Private
router.get('/matched', protect, (req: Request, res: Response) => {
  const matchedProducts = products.filter(p => p.matchedUser === req.user.id || p.sellerId === req.user.id && p.isSold);
  res.json(matchedProducts);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', (req: Request, res: Response) => {
  const product = products.find((p) => p._id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
router.post('/', protect, (req: Request, res: Response) => {
  const { name, description, image, faculty } = req.body; // New: faculty
  const user = users.find(u => u._id === req.user.id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const newProduct: Product = {
    _id: (Date.now()).toString(), // Use timestamp for a more unique ID
    name,
    description,
    image,
    sellerId: user._id,
    sellerName: user.name,
    faculty,
    requesters: [],
    isSold: false,
    matchedUser: null,
  };
  products.unshift(newProduct);
  res.status(201).json(newProduct);
});

// @desc    Request a product
// @route   POST /api/products/:id/request
// @access  Private
router.post('/:id/request', protect, (req: Request, res: Response) => {
  const product = products.find((p) => p._id === req.params.id);
  if (product && !product.isSold && product.sellerId !== req.user.id) {
    if (!product.requesters.includes(req.user.id)) {
      product.requesters.push(req.user.id);
    }
    res.json({ message: 'Request submitted' });
  } else {
    res.status(404).json({ message: 'Product not found or cannot be requested' });
  }
});

// @desc    Match a product with a user
// @route   POST /api/products/:id/match
// @access  Private
router.post('/:id/match', protect, (req: Request, res: Response) => {
  const { requesterId } = req.body;
  const product = products.find((p) => p._id === req.params.id);

  if (product && product.sellerId === req.user.id && !product.isSold) {
    if (product.requesters.includes(requesterId)) {
      product.isSold = true;
      product.matchedUser = requesterId;

      // Create a notification for the matched user
      const newNotification = {
        _id: (Date.now()).toString(),
        userId: requesterId,
        message: `「${product.name}」マッチング成立！`,
        read: false,
        createdAt: new Date(),
      };
      notifications.push(newNotification);

      res.json({ message: 'Match successful' });
    } else {
      res.status(400).json({ message: 'Requester not found in list' });
    }
  } else {
    res.status(404).json({ message: 'Product not found or you are not the seller' });
  }
});

// @desc    Get messages for a product
// @route   GET /api/products/:id/messages
// @access  Private (only matched users or seller)
router.get('/:id/messages', protect, (req: Request, res: Response) => {
  const product = products.find((p) => p._id === req.params.id);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  // Only matched users or seller can view messages
  if (req.user.id === product.sellerId || req.user.id === product.matchedUser) {
    const productMessages = messages
      .filter(m => m.productId === req.params.id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    res.json(productMessages);
  } else {
    res.status(403).json({ message: 'Not authorized to view messages for this product' });
  }
});

// @desc    Send a message for a product
// @route   POST /api/products/:id/messages
// @access  Private (only matched users or seller)
router.post('/:id/messages', protect, (req: Request, res: Response) => {
  const { message } = req.body;
  const product = products.find((p) => p._id === req.params.id);
  const sender = users.find(u => u._id === req.user.id);

  if (!product || !sender) {
    res.status(404).json({ message: 'Product or sender not found' });
    return;
  }

  // Only matched users or seller can send messages
  if (req.user.id === product.sellerId || req.user.id === product.matchedUser) {
    const newMessage: Message = {
      _id: (Date.now()).toString(),
      productId: req.params.id,
      senderId: req.user.id,
      senderName: sender.name,
      message,
      createdAt: new Date(),
    };
    messages.push(newMessage);
    res.status(201).json(newMessage);
  } else {
    res.status(403).json({ message: 'Not authorized to send messages for this product' });
  }
});

export default router;