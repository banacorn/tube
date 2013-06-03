{-# LANGUAGE OverloadedStrings #-}


module Simulation where

import Data.Aeson
import Data.List (lookup)
import Control.Applicative ((<$>), (<*>))
import Control.Monad (mzero)
import qualified Data.ByteString as B
import Data.ByteString.Lazy.Char8 (pack)
import Data.ByteString.UTF8 (toString)




type Probability = Double
type Coordinate = (Int, Int)
type Population = Int
type Flow = [Population]
data Block = Block Coordinate (Population, Population) deriving (Show, Eq)
data FlowBlock = FlowBlock Coordinate (Population, Population) Flow deriving (Show, Eq)
data Info = Info {
        _name :: String,
        _population :: Int
    } deriving Show
data Map = Map Info [Population] [Population] deriving (Show)
data Simulation = Simulation Info [FlowBlock]  

instance Show Simulation where
    show (Simulation info blocks) = "Simulation " ++ show info ++ " [" ++ show (length blocks) ++ "]"

parseMap :: [(B.ByteString, B.ByteString)] -> Map
parseMap hash = Map (Info { _name = name, _population = population}) mapIn mapOut
    where   name = case lookup "name" hash of
                Nothing -> ""
                Just n  -> ripQuote $ toString n
            population = case lookup "population" hash of
                Nothing -> 0
                Just n  -> read . toString $ n
            mapIn = case lookup "mapIn" hash of
                Nothing -> []
                Just n  -> read . toString $ n
            mapOut = case lookup "mapOut" hash of
                Nothing -> []
                Just n  -> read . toString $ n
            ripQuote = init . tail

testMap = Map (Info { _name = "Test", _population = 1000}) [0, 500, 200, 400] [200, 100, 200, 500]

processMap :: Map -> Simulation
processMap (Map info mapIn mapOut) = Simulation info blocks'
    where   blocks' = map (processBlock blocks) blocks
            blocks = map toBlock $ zip3 coordinates mapIn mapOut
            coordinates = [(x, y) | y <- [0 .. size], x <- [0 .. size]]
            size = floor . sqrt . fromIntegral . length $ mapIn
            toBlock (coord, pin, pout) = Block coord (pin, pout)


processBlock :: [Block] -> Block -> FlowBlock
processBlock blocks block = FlowBlock coord (pin, pout) (fromOnetoAll blocks block) 
    where   Block coord (pin, pout) = block


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

from       (Block _ (_, p)) = p
to         (Block _ (p, _)) = p
coordinate (Block c _     ) = c

a = Block (0, 0) (100, 100)
b = Block (30, 40) (400, 400)
c = Block (10, 10) (500, 500)
blocks = [a, b, c]


-- distance <->
(<->) a b = factor . sqrt . fromIntegral $ x * x + y * y
    where   (ax, ay) = coordinate a
            (bx, by) = coordinate b
            x = abs (ax - bx)
            y = abs (ay - by)
            factor = (* blockSize)
infix 8 <->


fromOnetoOne :: Block -> Block -> Probability
fromOnetoOne a b = (fromIntegral $ to b) * exp (-beta * a <-> b)

fromOnetoAll blocks block = dispatch (normalize total) (from block)
    where   total = map (fromOnetoOne block) blocks
            normalize list = map (* (recip $ sum list)) list

fromAlltoAll blocks = map (fromOnetoAll blocks) blocks