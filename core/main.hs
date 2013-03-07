
{-# LANGUAGE OverloadedStrings #-}


import Database.Redis
import Control.Monad.Trans (liftIO)
import Control.Monad
import System.Random --(getStdRandom, randomR, randomRs)  
import Data.Monoid
import Data.ByteString (ByteString)

connectAndRun f = connect defaultConnectInfo >>= flip runRedis f

--main = connectAndRun $ do
--    pubSub (subscribe ["node"]) $ \msg -> do
--        putStrLn $ "Message from " ++ show (msgMessage msg)
--        return mempty

getTubesSettings :: RedisCtx m f => m (f [(ByteString, ByteString)])
getTubesSettings = hgetall "tubes:settings"

test f = connectAndRun $ f >>= liftIO . print

type Name = String
type Time = Int
data Block = Residential | Commercial deriving (Eq, Show)
data Citizen = Citizen (Int, Int) (Int, Int) Time
data City = City Name [Block] [Citizen]

--kohl = City "Kohl" [Block] [Citizen]

randomNumbers :: Int -> (Int, Int) -> IO [Int]
randomNumbers n (from, to) = do
    gen <- newStdGen  
    return (take n (randomRs (from, to) gen))

genCityBlocks :: Int -> IO [Block]
genCityBlocks n = do
    numbers <- randomNumbers n (0, 1)
    return (map toBlock numbers)
    where
        toBlock 0 = Residential
        toBlock 1 = Commercial