function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>VeasnaShop</h5>
            <p className="mb-0">Your Ultimate Shopping Destination</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0">&copy; {new Date().getFullYear()} VeasnaShop. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 