import { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Define types
interface User {
  _id: string;
  name: string;
  email: string;
}
interface Product {
  _id: string;
  name: string;
  requesters: string[];
  isSold: boolean;
  matchedUser: string | null;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authContext = useContext(AuthContext);
  const { userInfo } = authContext!;

  useEffect(() => {
    const fetchData = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };
      try {
        const { data: userData } = await axios.get('http://localhost:3001/api/users/profile', config);
        setUser(userData);

        const { data: productsData } = await axios.get('http://localhost:3001/api/products/myproducts', config);
        setMyProducts(productsData);

        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (userInfo) {
      fetchData();
    }
  }, [userInfo]);

  const matchHandler = async (productId: string, requesterId: string) => {
    if (window.confirm('このユーザーとマッチングを成立させますか？この操作は取り消せません。')) {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo?.token}`,
                },
            };
            await axios.post(`http://localhost:3001/api/products/${productId}/match`, { requesterId }, config);
            // Refetch data to update UI
            const { data: productsData } = await axios.get('http://localhost:3001/api/products/myproducts', config);
            setMyProducts(productsData);
        } catch (err: any) {
            alert(err.response?.data?.message || err.message);
        }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <Row>
      <Col md={3}>
        <h2>ユーザープロフィール</h2>
        <Form>
          <Form.Group controlId="name">
            <Form.Label>名前</Form.Label>
            <Form.Control type="text" value={user?.name || ''} readOnly></Form.Control>
          </Form.Group>
          <Form.Group controlId="email">
            <Form.Label>メールアドレス</Form.Label>
            <Form.Control type="email" value={user?.email || ''} readOnly></Form.Control>
          </Form.Group>
        </Form>
      </Col>
      <Col md={9}>
        <h2>あなたが登録した教科書</h2>
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>タイトル</th>
              <th>ステータス</th>
              <th>希望者</th>
              <th>アクション</th>
            </tr>
          </thead>
          <tbody>
            {myProducts.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.isSold ? `成立済み (ID: ${product.matchedUser})` : '募集中'}</td>
                <td>{product.requesters.length} 人</td>
                <td>
                  {!product.isSold && product.requesters.map(reqId => (
                    <Button key={reqId} size="sm" onClick={() => matchHandler(product._id, reqId)}>
                      ID: {reqId} とマッチング
                    </Button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Col>
    </Row>
  );
};

export default ProfilePage;
