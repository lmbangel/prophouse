<?php

use LDAP\Result;

class Listings_model extends CI_Model
{

    private function callAPI($url, $data, $method)
    {
        $curl = curl_init();
        switch ($method) {
            case "POST":
                curl_setopt($curl, CURLOPT_POST, 1);
                curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
                break;
            case "GET":
                if ($data) {
                    $url .= '?';
                    foreach ($data as $key => $val) {
                        $url .= $key . '=' . urlencode($val);
                    }
                } else {
                }
                break;
        }
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

        if (curl_error($curl)) {
            $result = curl_error($curl);
        } else {
            $result = curl_exec($curl);
        }
        curl_close($curl);
        return $result;
    }
    public function getListings($slug = 'jeffreys-bay')
    {
        if ($slug == 'jeffreys-bay') {
            $data['location_id'] = 2;
            try {
                $response = json_decode($this->callAPI('https://business.propertyhouse.co.za/public/api/listings/summary', $data, "GET"));
            } catch (Exception $e) {
                $response = $e->getMessage();
            }
        }
        if ($slug != 'jeffreys-bay'){
            $data['location_id'] = $slug;
            try {
                $response = json_decode($this->callAPI('https://business.propertyhouse.co.za/public/api/listings/summary', $data, "GET"));
            } catch (Exception $e) {
                $response = $e->getMessage();
            }
        }
        
        return $response;
    }
    public function searchListingsByCity($city)
    {
        $city = trim($city);
        $data['city'] = $city;
        try {
            $response = json_decode($this->callAPI('https://business.propertyhouse.co.za/public/api/locationsearch/summary', $data, "GET"));
        } catch (Exception $e) {
            $response = $e->getMessage();
        }
        
        return $response;
    }

    public function getListingById($id)
    {
        $data = array();
        try {
            $response = json_decode($this->callAPI('https://business.propertyhouse.co.za/public/api/listings/read/' . $id, $data, ""));
        } catch (Exception $e) {
            $response = $e->getMessage();
        }
        return $response;
    }
}
