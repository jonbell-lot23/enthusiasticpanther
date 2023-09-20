#!/bin/bash

count=142

for file in *.png; do
  new_name="show${count}.png"

  mv "${file}" "${new_name}"
  echo "Renamed ${file} to ${new_name}"

  ((count++))
done
