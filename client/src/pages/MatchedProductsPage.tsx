import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

interface Product {
  _id: string;
  name: string;
  image: string;
  sellerName: string;
  matchedUser: string | null;
  sellerId: string;
  faculty: string; // New: Faculty field
}

const MatchedProductsPage = () => {
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authContext = useContext(AuthContext);
  const { userInfo } = authContext!;

  useEffect(() => {
    const fetchMatchedProducts = async () => {
      if (!userInfo) return;
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:3001/api/products/matched', config);
        setMatchedProducts(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchMatchedProducts();
  }, [userInfo]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div>
      <h1>チャット</h1>
      {matchedProducts.length === 0 ? (
        <p>まだチャットはありません。</p>
      ) : (
        <Row>
          {matchedProducts.map((product) => (
            <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
              <Card className="my-3 p-3 rounded">
                <Card.Img src={`http://localhost:3001${product.image}`} variant="top" />
                <Card.Body>
                  <Card.Title as="div">
                    <strong>{product.name}</strong>
                  </Card.Title>
                  <Card.Text as="p">
                    {userInfo?._id === product.sellerId ? (
                      <>譲渡相手: {product.matchedUser}</>
                    ) : (
                      <>出品者: {product.sellerName}</>
                    )}
                  </Card.Text>
                  <Card.Text as="small" className="text-muted">学系: {product.faculty}</Card.Text>
                  <Link to={`/product/${product._id}/chat`}>
                    <Button variant="primary" className="btn-block">
                      チャットルームへ
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MatchedProductsPage;
