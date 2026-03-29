function TestPage() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#ffffff',
      color: '#000000',
      padding: '50px',
      zIndex: 99999
    }}>
      <h1 style={{ fontSize: '48px' }}>测试页面</h1>
      <p style={{ fontSize: '24px', marginTop: '20px' }}>这个页面应该是可见的</p>
      <div style={{ 
        marginTop: '30px', 
        background: '#f0f0f0', 
        padding: '30px', 
        borderRadius: '8px' 
      }}>
        这是内容区域
      </div>
    </div>
  );
}

export default TestPage;
