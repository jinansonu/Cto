import CameraTab from './components/CameraTab';

const App = () => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Camera Mode Capture &amp; OCR</h1>
        <p>Scan documents, extract text with OCR, and submit enriched context to the assistant.</p>
      </header>
      <main className="app-content">
        <section className="section-card">
          <CameraTab />
        </section>
      </main>
    </div>
  );
};

export default App;
