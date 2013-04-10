
{-# LANGUAGE OverloadedStrings #-}


import Database.Redis
import Control.Monad.Trans (liftIO)
import Control.Monad
import System.Random --(getStdRandom, randomR, randomRs)  
import Data.Monoid
import Data.ByteString (ByteString)

--import Data.Array.IO
import Data.Array.IO


connectAndRun f = connect defaultConnectInfo >>= flip runRedis f

getTubesSettings :: RedisCtx m f => m (f [(ByteString, ByteString)])
getTubesSettings = hgetall "tubes:settings"

test f = connectAndRun $ f >>= liftIO . print

ack :: Redis ()
ack = pubSub (subscribe ["tubes"]) $ \msg -> do
      putStrLn $ "Message from " ++ show (msgMessage msg)
      return mempty

data Type = LowRes | HighRes | LowCom | HighCom deriving (Eq)
type Address = (Int, Int)
type Population = Int
type Destination = (Address, Population)
type Flow = (Int, Int)
data Block = Block Type Flow [Destination]

instance Show Type where
    show LowRes = "r"
    show HighRes = "R"
    show LowCom = "c"
    show HighCom = "C"

instance Show Block where
    show (Block blockType (i, o) destinations) = "[ " ++ show blockType ++ " " ++ show i ++ "+ " ++ show o ++ "- ]"

typeFlow :: Type -> Flow
typeFlow LowRes = (0, 200)
typeFlow HighRes = (100, 800)
typeFlow LowCom = (200, 0)
typeFlow HighCom = (800, 100)

a = Block LowCom (typeFlow LowCom) [] --[((2, 4) 100)]

data City = City Int [Block]

--instance Show City where
--    show (City size blocks) =  









--instance Show Block where
    --show (Block (i, o)) = " +" ++ show i ++ " -" ++ show o ++ " "

--instance Show (IOArray index element) where
--    show array = concat . getElems $ mapArray show array

--a = newListArray (0, 10) (Block (0, 0))

--main = do
--    city <- newArray (0, 100) (Block (0, 0)) :: IO (IOArray Int Block)

--    putStrLn . show $ city

--tweak :: IO 
--tweak city (a, b) = do
--    Block (ai, ao) <- readArray city a
--    writeArray city a (Block (ai, ao + 1))
--    Block (bi, bo) <- readArray city b
--    writeArray city b (Block (bi + 1, bo))



--a = replicate 100 (Block (0, 0))

--tweak ::  (Int, Int) -> City -> City
--tweak _ (City [] n) = (City [] n)
--tweak (0, 0) (City (x:xs) n) = City (x:xs) n
--tweak (0, o) (City (x:xs) n) = incrBlock x : tweak (City (-1, pred o) n) xs
--tweak (i, 0) (City (x:xs) n) = decrBlock x : tweak (City (pred i, -1) n) xs
--tweak (i, o) (City (x:xs) n) = x : tweak (City (pred i, pred o) n) xs

--incrBlock (Block (i, o)) = Block (succ i, o) 
--decrBlock (Block (i, o)) = Block (i, pred o) 

