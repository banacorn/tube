{-# LANGUAGE OverloadedStrings #-}


module Simulation where

import Data.Aeson
import Control.Applicative ((<$>), (<*>))
import Control.Monad (mzero)
import Data.ByteString.Lazy.Char8 (pack)
import Data.ByteString.UTF8 (toString)




type Probability = Double
type Coordinate = (Int, Int)
type Population = Int
data Block  = Block Coordinate (Population, Population) deriving (Show, Eq)
data Map = Map String Int [Population] [Population] deriving (Show)

parseMap :: String -> Map
parseMap raw = case decode (pack raw) of
    Just cooked -> cooked
    Nothing     -> Map "Untitled" 0 [] []

main = do
    c <- readFile "../dump.json" 
    print $ parseMap c




instance FromJSON Map where
    parseJSON (Object v) =  Map <$> 
                            v .: "name" <*>
                            v .: "population" <*>
                            v .: "mapIn" <*>
                            v .: "mapOut"
    parseJSON _          = mzero









--  linear time dispatching (deterministic, not ideal)
--dispatch :: [Probability] -> Int -> [Int]
--dispatch probs quantity = sprinkle baseShare (quantity - baseSum)
--    where   
--            baseShare = map (\p -> floor $ fromIntegral quantity * p) probs
--            baseSum = sum baseShare
--            sprinkle xs 0 = xs
--            sprinkle (x:xs) n = (succ x):sprinkle xs (pred n)

--beta = a * (exp (-s * v))
--    where   a = 0.000315
--            s = log (blockSize * blockSize)
--            v = 0.177

--blockSize = 100 :: Double

--from (Block _ _      (Out p)) = p
--to (Block _ (In p) _      ) = p
--coordinate (Block c _ _) = c

--a = Block (0, 0) (In 300) (Out 300)
--b = Block (30, 40) (In 400) (Out 400)
--c = Block (1, 1) (In 100) (Out 100)

--(<->) a b = factor . sqrt . fromIntegral $ x * x + y * y
--    where   (ax, ay) = coordinate a
--            (bx, by) = coordinate b
--            x = abs (ax - bx)
--            y = abs (ay - by)
--            factor = (* blockSize)

--infix 8 <->

--flow :: Block -> Block -> Double
--flow a b = (fromIntegral $ to b) * exp (-beta * a <-> b)

--blocks = [a, b, c]

--buildFlowTable blocks block = dispatch (normalize total) (from block)
--    where   total = map (flow block) blocks
--            normalize list = map (* (recip $ sum list)) list
