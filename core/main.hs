
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

--data Type = LowRes | HighRes | LowCom | HighCom deriving (Eq)
--type Address = (Int, Int)
--type Population = Int
--type Destination = (Address, Population)
--type Flow = (Int, Int)
--data Block = Block Type Flow [Destination]

--instance Show Type where
--    show LowRes = "r"
--    show HighRes = "R"
--    show LowCom = "c"
--    show HighCom = "C"

--instance Show Block where
--    show (Block blockType (i, o) destinations) = "[ " ++ show blockType ++ " " ++ show i ++ "+ " ++ show o ++ "- ]"

--typeFlow :: Type -> Flow
--typeFlow LowRes = (0, 200)
--typeFlow HighRes = (100, 800)
--typeFlow LowCom = (200, 0)
--typeFlow HighCom = (800, 100)

--a = Block LowCom (typeFlow LowCom) [] --[((2, 4) 100)]

--data City = City Int [Block]















