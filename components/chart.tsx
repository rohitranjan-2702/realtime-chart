"use client";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  YAxis,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import React, { useEffect, useState } from "react";

interface CustomTooltipProps {
  active: boolean;
  payload: any[];
  label: string;
}

type KlineEvent = {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: string; // Symbol
    i: string; // Interval
    f: number; // First trade ID
    L: number; // Last trade ID
    o: string; // Open price
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    v: string; // Base asset volume
    n: number; // Number of trades
    x: boolean; // Is this kline closed?
    q: string; // Quote asset volume
    V: string; // Taker buy base asset volume
    Q: string; // Taker buy quote asset volume
    B: string; // Ignore
  };
};

type ChartDataset = {
  time: string;
  price: number;
};

export default function Chart() {
  const [historicalData, setHistoricalData] = useState<ChartDataset[]>([]);
  const [symbol, setSymbol] = useState("ETHUSDT");
  const [interval, setInterval] = useState("1d");
  const [realtimePrice, setRealtimePrice] = useState(0);
  const [realtime, setRealtime] = useState(0);

  const fetchData = async () => {
    const response = await fetch(
      `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}`,
    );
    const data = await response.json();

    setHistoricalData((prev) => [
      ...prev,
      ...data.map((d: any[]) => {
        return {
          time: new Date(d[6]).toLocaleDateString(),
          price: parseFloat(d[4]).toFixed(2),
        };
      }),
    ]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // https://data-api.binance.vision/api/v3/klines?symbol=ETHUSDT&interval=30m
  // https://data-api.binance.vision/api/v3/trades?symbol=ETHUSDT

  useEffect(() => {
    const socket = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`,
    );

    socket.onmessage = (event) => {
      // console.log(event.data);
      const data: KlineEvent = JSON.parse(event.data);

      setRealtimePrice(parseFloat(data.k.c));
      setRealtime(data.k.T);

      setTimeout(() => {
        setHistoricalData((prev) => [
          ...prev,
          {
            time: new Date(data.k.T).toLocaleDateString(),
            price: parseFloat(data.k.c),
          },
        ]);
      }, 2000);
    };

    return () => {
      socket.close();
    };
  }, []);

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip rounded-lg bg-white p-2">
          <p className="label text-xs font-medium">{`${label}`}</p>
          <p className="label mt-1 text-xs font-bold text-green-600">{`$ ${payload[0].value} `}</p>
        </div>
      );
    }

    return <></>;
  };

  return (
    <div className="w-full p-12">
      <AreaChart
        width={1400}
        height={500}
        data={historicalData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" />
        <Legend verticalAlign="top" height={36} />
        <YAxis orientation="right" />
        <ReferenceLine y={realtimePrice} stroke="green" label={realtimePrice} />
        <ReferenceDot x={realtime} y={realtimePrice} r={10} stroke="green" />
        <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
        <Area
          type="monotone"
          fillOpacity={1}
          fill="url(#colorUv)"
          dataKey="price"
          stroke="#82ca9d"
          activeDot={{ r: 4 }}
          animationDuration={1000}
        />
      </AreaChart>
      <p className="text-yellow-700" contentEditable={true}>
        SYMBOL: {symbol}
      </p>
      <p className="text-yellow-500">
        Realtime Price: ${realtimePrice.toFixed(4)}
      </p>
    </div>
  );
}
