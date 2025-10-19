'use client'

import { useEffect, useState } from 'react'
import { API_BASE } from '@/lib/constants'

// ---------------- Types ----------------
interface Region {
    id: string
    name: string
}

interface PostalArea {
    id: string
    name: string
    postal_code: number
}

interface FormData {
    email: string
    firstName: string
    lastName: string
    address: string
    apartment: string
    province: string
    city: string
    district: string
    village: string
    postalCode: string
    phone: string
    country: string
    paymentMethod: string
}

interface AddressSelectorProps {
    form: FormData
    setForm: React.Dispatch<React.SetStateAction<FormData>>
}

// ---------------- Component ----------------
export default function AddressSelector({ form, setForm }: AddressSelectorProps) {
    const [provinces, setProvinces] = useState<Region[]>([])
    const [cities, setCities] = useState<Region[]>([])
    const [districts, setDistricts] = useState<Region[]>([])
    const [villages, setVillages] = useState<Region[]>([])
    const [postalOptions, setPostalOptions] = useState<number[]>([])
    const [loading, setLoading] = useState(false)

    // ---------------- Province fetch ----------------
    useEffect(() => {
        fetch(`${API_BASE}/wilayah/provinces`)
            .then((res) => res.json() as Promise<Region[]>)
            .then((data) => setProvinces(Array.isArray(data) ? data : []))
            .catch((err) => console.error('❌ Failed to load provinces:', err))
    }, [])

    // ---------------- Province Change ----------------
    const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceId = e.target.value
        if (!provinceId) {
            setCities([]); setDistricts([]); setVillages([]); setPostalOptions([])
            setForm((prev) => ({ ...prev, province: '', city: '', district: '', village: '', postalCode: '' }))
            return
        }

        const provinceName = provinces.find((p) => p.id === provinceId)?.name || ''
        setForm((prev) => ({ ...prev, province: provinceName, city: '', district: '', village: '', postalCode: '' }))

        try {
            const res = await fetch(`${API_BASE}/wilayah/cities/${provinceId}`)
            const data = (await res.json()) as Region[]
            setCities(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('❌ Failed to fetch cities:', err)
            setCities([])
        }
    }

    // ---------------- City Change ----------------
    const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityId = e.target.value
        if (!cityId) {
            setDistricts([]); setVillages([]); setPostalOptions([])
            setForm((prev) => ({ ...prev, city: '', district: '', village: '', postalCode: '' }))
            return
        }

        const cityName = cities.find((c) => c.id === cityId)?.name || ''
        setForm((prev) => ({ ...prev, city: cityName, district: '', village: '', postalCode: '' }))

        try {
            const res = await fetch(`${API_BASE}/wilayah/districts/${cityId}`)
            const data = (await res.json()) as Region[]
            setDistricts(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('❌ Failed to fetch districts:', err)
            setDistricts([])
        }
    }

    // ---------------- District Change ----------------
    const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtId = e.target.value
        if (!districtId) {
            setVillages([]); setPostalOptions([])
            setForm((prev) => ({ ...prev, district: '', village: '', postalCode: '' }))
            return
        }

        const districtName = districts.find((d) => d.id === districtId)?.name || ''
        setForm((prev) => ({ ...prev, district: districtName, village: '', postalCode: '' }))

        try {
            const res = await fetch(`${API_BASE}/wilayah/villages/${districtId}`)
            const data = (await res.json()) as Region[]
            setVillages(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('❌ Failed to fetch villages:', err)
            setVillages([])
        }
    }

    // ---------------- Village Change (with Postal) ----------------
    const handleVillageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const villageId = e.target.value
        if (!villageId) {
            setPostalOptions([])
            setForm((prev) => ({ ...prev, village: '', postalCode: '' }))
            return
        }

        const villageName = villages.find((v) => v.id === villageId)?.name || ''
        setForm((prev) => ({ ...prev, village: villageName, postalCode: '' }))
        setPostalOptions([])

        try {
            setLoading(true)
            const locationQuery = form.district || form.city
            const res = await fetch(`${API_BASE}/wilayah/postal?input=${encodeURIComponent(locationQuery)}`)
            const data = (await res.json()) as { areas: PostalArea[] }
            const areas = Array.isArray(data?.areas) ? data.areas : []

            const uniqueCodes = Array.from(new Set(areas.map((a) => a.postal_code)))
            setPostalOptions(uniqueCodes)

            if (uniqueCodes.length > 0) {
                setForm((prev) => ({ ...prev, postalCode: uniqueCodes[0].toString() }))
            }
        } catch (err) {
            console.error('❌ Postal code fetch failed:', err)
        } finally {
            setLoading(false)
        }
    }

    // ---------------- Manual Change ----------------
    const handleManualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    // ---------------- Helper ----------------
    const safeFindId = (arr: Region[], key: string): string => {
        const found = arr.find((a) => a.name === key)
        return found ? found.id : ''
    }

    // ---------------- Render ----------------
    return (
        <div className="space-y-3 text-gray-500">
            {/* Province */}
            <div>
                <label className="text-sm text-gray-600 mb-1 block">Province</label>
                <select
                    onChange={handleProvinceChange}
                    value={safeFindId(provinces, form.province)}
                    className="w-full border border-gray-300 rounded-md p-3"
                >
                    <option value="">Select Province</option>
                    {provinces.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* City */}
            <div>
                <label className="text-sm text-gray-600 mb-1 block">City / Regency</label>
                <select
                    onChange={handleCityChange}
                    disabled={!cities.length}
                    value={safeFindId(cities, form.city)}
                    className="w-full border border-gray-300 rounded-md p-3"
                >
                    <option value="">Select City</option>
                    {cities.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* District */}
            <div>
                <label className="text-sm text-gray-600 mb-1 block">District / Kecamatan</label>
                <select
                    onChange={handleDistrictChange}
                    disabled={!districts.length}
                    value={safeFindId(districts, form.district)}
                    className="w-full border border-gray-300 rounded-md  p-3  "
                >

                    <option value="">Select District</option>
                    {districts.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>

            {/* Village */}
            <div>
                <label className="text-sm text-gray-600 mb-1 block">Village / Kelurahan</label>
                <select
                    onChange={handleVillageChange}
                    disabled={!villages.length}
                    value={safeFindId(villages, form.village)}
                    className="w-full border border-gray-300 rounded-md p-3"
                >
                    <option value="">Select Village</option>
                    {villages.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                </select>
            </div>

            {/* Postal Code */}
            <div>
                <label className="text-sm text-gray-600 mb-1 block">Postal Code</label>
                {postalOptions.length > 1 ? (
                    <select
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleManualChange}
                        className="w-full border border-gray-300 rounded-md p-3"
                    >
                        {postalOptions.map((code) => (
                            <option key={code} value={code}>{code}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        name="postalCode"
                        placeholder="Postal Code"
                        value={form.postalCode}
                        onChange={handleManualChange}
                        className="w-full border border-gray-300 rounded-md p-3"
                    />
                )}
            </div>

            {loading && <p className="text-sm text-gray-500">Fetching postal code...</p>}
        </div>
    )
}
