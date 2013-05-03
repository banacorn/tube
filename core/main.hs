
{-# LANGUAGE OverloadedStrings #-}


import Database.Redis
import Control.Monad.Trans (liftIO)
import Control.Monad
import System.Random --(getStdRandom, randomR, randomRs)  
import Data.Monoid
import Data.ByteString (ByteString)

--import Data.Array.IO
import Data.Array.IO


--
--  some redis shit
--

connectAndRun f = connect defaultConnectInfo >>= flip runRedis f

getTubesSettings :: RedisCtx m f => m (f [(ByteString, ByteString)])
getTubesSettings = hgetall "tubes:settings"

test f = connectAndRun $ f >>= liftIO . print

ack :: Redis ()
ack = pubSub (subscribe ["tubes"]) $ \msg -> do
      putStrLn $ "Message from " ++ show (msgMessage msg)
      return mempty

--
--  
--

data Population = In Int | Out Int deriving (Show, Eq)
data Block  = Block Population Population deriving (Show, Eq)

--  linear time dispatching (deterministic, not ideal)
type Probability = Float
dispatch :: [Probability] -> Int -> [Int]
dispatch probs quantity = sprinkle baseShare (quantity - baseSum)
    where   size = length probs
            baseShare = map (\p -> floor $ fromIntegral quantity * p) probs
            baseSum = sum baseShare
            sprinkle xs 0 = xs
            sprinkle (x:xs) n = (succ x):sprinkle xs (pred n)