import { useEffect, useState } from 'react';
import { Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import { LinkContainer } from 'react-router-bootstrap';

const faculties = ['すべて', 'RU', 'RB', 'RD', 'RE', 'RM', 'RG'];

// Define the type for a single product
interface Product {
  _id: string;
  name: string;
  image: string;
  description: string;
  sellerName: string;
  faculty: string; // New: Faculty field
  isSold: boolean;
}

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFaculty, setActiveFaculty] = useState(faculties[0]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = activeFaculty === 'すべて'
          ? 'http://localhost:3001/api/products'
          : `http://localhost:3001/api/products?faculty=${activeFaculty}`;
        const { data } = await axios.get(url);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [activeFaculty]);

  return (
    <>
      <h1>譲渡希望の教科書</h1>
      <Tabs
        id="faculty-tabs"
        activeKey={activeFaculty}
        onSelect={(k) => setActiveFaculty(k as string)}
        className="mb-3"
      >
        {faculties.map((f) => (
          <Tab eventKey={f} title={f} key={f}>
            <Row>
              {products.map((product) => (
                <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                  <LinkContainer to={`/product/${product._id}`} style={{ pointerEvents: product.isSold ? 'none' : 'auto' }}>
                    <Card className="my-3 p-3 rounded" style={{ opacity: product.isSold ? 0.7 : 1 }}>
                      {product.isSold && <div className="card-sold-overlay">譲渡済み</div>}
                      <Card.Img src={`http://localhost:3001${product.image}`} variant="top" />
                      <Card.Body>
                        <Card.Title as="div">
                          <strong>{product.name}</strong>
                        </Card.Title>
                        <Card.Text as="p">{product.description}</Card.Text>
                        <Card.Text as="small" className="text-muted">学系: {product.faculty}</Card.Text>
                      </Card.Body>
                    </Card>
                  </LinkContainer>
                </Col>
              ))}
            </Row>
          </Tab>
        ))}
      </Tabs>
    </>
  );
};

export default HomePage;