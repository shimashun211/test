import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Form, Button, Card, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

interface Message {
  _id: string;
  productId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [productName, setProductName] = useState('');
  const authContext = useContext(AuthContext);
  const { userInfo } = authContext!;

  const fetchMessages = async () => {
    if (!userInfo) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`http://localhost:3001/api/products/${id}/messages`, config);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchProductName = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3001/api/products/${id}`);
      setProductName(data.name);
    } catch (error) {
      console.error('Error fetching product name:', error);
    }
  };

  useEffect(() => {
    fetchProductName();
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [id, userInfo]);

  const sendMessageHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInfo || !newMessage.trim()) return;

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(`http://localhost:3001/api/products/${id}/messages`, { message: newMessage }, config);
      setNewMessage('');
      fetchMessages(); // Refresh messages after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <Link className="btn btn-light my-3" to={`/product/${id}`}>
        商品詳細に戻る
      </Link>
      <h1>「{productName}」のチャット</h1>
      <Card className="mb-3">
        <ListGroup variant="flush">
          {messages.length === 0 ? (
            <ListGroup.Item>まだメッセージはありません。</ListGroup.Item>
          ) : (
            messages.map((msg) => (
              <ListGroup.Item key={msg._id} className={msg.senderId === userInfo?._id ? 'text-end' : 'text-start'}>
                <strong>{msg.senderName}:</strong> {msg.message}
                <br />
                <small>{new Date(msg.createdAt).toLocaleString()}</small>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </Card>
      <Form onSubmit={sendMessageHandler}>
        <Form.Group className="d-flex">
          <Form.Control
            type="text"
            placeholder="メッセージを入力..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="me-2"
          />
          <Button type="submit" variant="primary">
            送信
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default ChatPage;
