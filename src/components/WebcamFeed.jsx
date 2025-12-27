export default function WebcamFeed({ videoRef }) {
  return <video ref={videoRef} width={480} height={360} autoPlay muted />;
}
