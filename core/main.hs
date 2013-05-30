
{-# LANGUAGE OverloadedStrings #-}


import Database.Redis
import Control.Monad.Trans (liftIO)
import Control.Monad
import Control.Monad.ST
import System.Random --(getStdRandom, randomR, randomRs)  
import Data.Monoid
import Data.ByteString (ByteString)

--import Data.Array.IO
import Data.Array.ST


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



--
--  
--

type Coordinate = (Int, Int)
type Probability = Double
data Population = In Int | Out Int deriving (Show, Eq)
data Block  = Block Coordinate Population Population deriving (Show, Eq)
data Flow = Flow Population [Population] deriving (Show, Eq)

--  linear time dispatching (deterministic, not ideal)
dispatch :: [Probability] -> Int -> [Int]
dispatch probs quantity = sprinkle baseShare (quantity - baseSum)
    where   
            baseShare = map (\p -> floor $ fromIntegral quantity * p) probs
            baseSum = sum baseShare
            sprinkle xs 0 = xs
            sprinkle (x:xs) n = (succ x):sprinkle xs (pred n)

beta = a * (exp (-s * v))
    where   a = 0.000315
            s = log (blockSize * blockSize)
            v = 0.177

blockSize = 100 :: Double

from (Block _ _      (Out p)) = p
to (Block _ (In p) _      ) = p
coordinate (Block c _ _) = c

a = Block (0, 0) (In 300) (Out 300)
b = Block (30, 40) (In 400) (Out 400)
c = Block (1, 1) (In 100) (Out 100)

(<->) a b = factor . sqrt . fromIntegral $ x * x + y * y
    where   (ax, ay) = coordinate a
            (bx, by) = coordinate b
            x = abs (ax - bx)
            y = abs (ay - by)
            factor = (* blockSize)

infix 8 <->

flow :: Block -> Block -> Double
flow a b = (fromIntegral $ to b) * exp (-beta * a <-> b)

blocks = [a, b, c]

buildFlowTable blocks block = dispatch (normalize total) (from block)
    where   total = map (flow block) blocks
            normalize list = map (* (recip $ sum list)) list

--heatup :: [Block] -> [Flow]
--heatup blocks = 
type Array s = ST s (STArray s Int Population)

buildPair = do
    arr <- newArray (1, 1600) (In 0) :: ST s (STArray s Int Population)
    a <- readArray arr 1
    writeArray arr 1 (In 50)
    b <- readArray arr 1
    return (a, b)

--main = print $ runST buildPair