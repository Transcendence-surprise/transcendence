// // multiplayer lobby

// export default function LobbyRoute() {
//   const { gameId } = useParams();
//   const [game, setGame] = useState<any>(null);
//   const currentUserId = generateTempUserId(); // temp

//   useEffect(() => {
//     const interval = setInterval(() => {
//       getGameState(gameId!).then(setGame);
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [gameId]);

//   const handleStart = () => {
//     startGame(gameId!).then(() => navigate(`/game/${gameId}`));
//   };

//   if (!game) return <div>Loading...</div>;

//   return <Lobby game={game} currentUserId={currentUserId} onGameStarted={handleStart} />;
// }
