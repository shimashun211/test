import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Define the type for a single product
interface Product {
  _id: string;
  name: string;
  image: string;
  description: string;
  sellerId: string;
  sellerName: string;
  faculty: string; // New: Faculty field
  requesters: string[];
  isSold: boolean;
  matchedUser: string | null;
}

const ProductPage = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [alreadyRequested, setAlreadyRequested] = useState(false);
  const { id } = useParams<{ id: string }>();
  const authContext = useContext(AuthContext);
  const { userInfo } = authContext!;

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3001/api/products/${id}`);
      setProduct(data);
      if (userInfo && data.requesters.includes(userInfo._id)) {
        setAlreadyRequested(true);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id, userInfo]);

  const requestHandler = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };
      await axios.post(`http://localhost:3001/api/products/${id}/request`, {}, config);
      setAlreadyRequested(true);
      fetchProduct(); // Refetch to update UI
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  const isMatchedUser = userInfo && (userInfo._id === product.sellerId || userInfo._id === product.matchedUser);

  return (
    <>
      <Link className="btn btn-light my-3" to="/">
        戻る
      </Link>
      <Row>
        <Col md={6}>
          <Image src={`http://localhost:3001${product.image}`} alt={product.name} fluid />
        </Col>
        <Col md={6}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h3>{product.name}</h3>
            </ListGroup.Item>
            <ListGroup.Item>
              {product.isSold ? (
                <Alert variant='danger'>この教科書は譲渡先が決定しました</Alert>
              ) : (
                '募集中'
              )}
            </ListGroup.Item>
            <ListGroup.Item>詳細: {product.description}</ListGroup.Item>
            <ListGroup.Item>出品者: {product.sellerName}</ListGroup.Item>
            <ListGroup.Item>学系: {product.faculty}</ListGroup.Item>
            {userInfo && userInfo._id !== product.sellerId && !product.isSold && (
              <ListGroup.Item>
                <Button
                  onClick={requestHandler}
                  className="btn-block"
                  type="button"
                  disabled={alreadyRequested}
                >
                  {alreadyRequested ? '譲渡希望済み' : '譲渡を希望する'}
                </Button>
              </ListGroup.Item>
            )}
            {product.isSold && isMatchedUser && (
              <ListGroup.Item>
                <Link to={`/product/${product._id}/chat`}>
                  <Button className="btn-block" type="button">
                    チャットルームへ
                  </Button>
                </Link>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Col>
      </Row>
    </>
  );
};

export default ProductPage;
