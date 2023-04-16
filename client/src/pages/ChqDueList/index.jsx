import { useState, useEffect, Suspense, lazy, Fragment } from "react";
import Axios from "axios";
import ReadOnlyRow from "./Table/ReadOnlyRow";
import EditableRow from "./Table/EditTableRow";
import TableHead from "../../components/Table/TableHead";

import { useSortableTable } from "../../components/Table/useSortableTable";
import { Transition } from "@headlessui/react";

import { errorData, errorCheck } from "./Error";
import { generatedToast, Toast } from "../../components/Toast";
import { fetchData } from "../../hooks/fetchData";

import NoDataFound from "../../utils/NoDataFound";
import LoadMore from "../../utils/LoadMore";
import PingLoader from "../../utils/PingLoader";

import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const TableHeader = [
    {
        id: 2,
        name: "Order Job Number",
        accessor: "order_job_number",
    },
    {
        id: 3,
        name: "LA name",
        accessor: "LA_name",
        sortable: true,
    },
    { id: 4, name: "LV Name", accessor: "LV_name", sortable: true },
    { id: 5, name: "Commodity", accessor: "commodity", sortable: true },
    { id: 6, name: "Mode", accessor: "mode", sortable: true },
    {
        id: 10,
        name: "Chq Issue Date",
        accessor: "chq_issue_date",
        sortable: true,
    },
    { id: 7, name: "Chq Amount", accessor: "chq_amount" },
    { id: 8, name: "Part Pay", accessor: "part_pay" },
    { id: 9, name: "Balance", accessor: "balance", sortable: true },
    // { id: 11, name: "Amount", accessor: "init_amount" },
    { id: 12, name: "Payment", accessor: "payment" },
    { id: 13, name: "Amount", accessor: "final_amount" },
    { id: 14, name: "Actions" },
];

const opt = [{ value: "All" }, { value: "Own" }, { value: "Other" }];

const AddPaymentInformation = lazy(() => import("./AddPaymentInformation"));

const App = () => {
    // new start
    const [ChqList, setChqList] = useState([]);
    const [laNames, setLaNames] = useState([]);
    const [filterByShip, setFilterByShip] = useState(opt[0]);
    const [btnPayClicked, setBtnPayClicked] = useState(false);
    const [tableData, handleSorting] = useSortableTable(ChqList, TableHeader);
    const [cursorPos, setCursorPos] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [orderJobList, setOrderJobList] = useState([]);

    // fetch data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData(
            `${process.env.REACT_APP_API_URL}/management/getchqlist?filterByShip=${filterByShip.value}`,
            setChqList,
            setLoading,
            setError
        );
    }, [filterByShip]);

    // search filter for all fields
    const [query, setQuery] = useState("");

    const data = Object.values(tableData);
    function search(items) {
        if (query !== "" && cursorPos !== 1) {
            setCursorPos(1);
        }
        const res = items.filter(
            (item) =>
                item.LA_name.includes(laNames) &&
                Object.keys(Object.assign({}, ...data)).some((parameter) =>
                    item[parameter]
                        ?.toString()
                        .toLowerCase()
                        .includes(query.toLowerCase())
                )
        );
        return res.slice(
            (cursorPos - 1) * pageSize,
            (cursorPos - 1) * pageSize + pageSize
        );
    }

    //edit status
    const [editFormData, setEditFormData] = useState({
        order_job_number: "",
        LA_name: "",
        LV_name: "",
        commodity: "",
        mode: "",
        chq_amount: "",
        chq_issue_date: "",
        part_pay: "",
        payment: "Part",
        amount: "",
    });

    const [paymentModalData, setPaymentModalData] = useState({
        order_job_number: "",
        LA_name: "",
        LV_name: "",
        commodity: "",
        mode: "",
        chq_issue_date: "",
        chq_amount: "",
        part_pay: "",
        balance: "",
        payment: "",
        amount: "",
        payment_chq_no: "",
        payment_chq_amount: "",
        payment_chq_date: "",
    });

    //modified id status
    const [editChqOrderJobNumber, setEditChqOrderJobNumber] = useState(null);
    const [editChqMode, setEditChqMode] = useState(null);

    //Update status with correction data
    const handleEditFormChange = (event) => {
        event.preventDefault();

        const fieldName = event.target.getAttribute("name");
        const fieldValue = event.target.value;

        const newFormData = { ...editFormData };
        newFormData[fieldName] = fieldValue;

        setEditFormData(newFormData);
    };

    //save modified data (App component)
    const handleEditFormSubmit = (event) => {
        event.preventDefault(); // prevent submit

        const editedChq = {
            order_job_number: editFormData.order_job_number,
            LA_name: editFormData.LA_name,
            LV_name: editFormData.LV_name,
            commodity: editFormData.commodity,
            mode: editFormData.mode,
            chq_amount: Number(editFormData.part_pay),
            chq_issue_date: editFormData.chq_issue_date,
            part_pay: Number(editFormData.part_pay),
            balance:
                Number(editFormData.chq_amount) - Number(editFormData.part_pay),
            payment: editFormData.payment,
            amount: Number(editFormData.amount),
        };
        editedChq.payment =
            editedChq.payment == null ? "Part" : editedChq.payment;

        Axios.post(
            `${process.env.REACT_APP_API_URL}/management/updatechq`,
            editedChq
        ).then((response) => {
            generatedToast(response);
        });

        const index = tableData.findIndex(
            (td) =>
                td.order_job_number === editChqOrderJobNumber &&
                td.mode === editChqMode
        );
        tableData[index] = editedChq;
        setChqList(tableData);

        setEditChqOrderJobNumber(null);
        setEditChqMode(null);
    };

    //Read-only data If you click the edit button, the existing data is displayed
    const handleEditClick = (event, Chq) => {
        setBtnPayClicked(false);
        event.preventDefault(); // ???

        setEditChqOrderJobNumber(Chq.order_job_number);
        setEditChqMode(Chq.mode);

        const formValues = {
            order_job_number: Chq.order_job_number,
            LA_name: Chq.LA_name,
            LV_name: Chq.LV_name,
            commodity: Chq.commodity,
            mode: Chq.mode,
            chq_amount: Number(Chq.chq_amount),
            chq_issue_date: Chq.chq_issue_date,
            part_pay: Number(Chq.part_pay),
            balance: Number(Chq.balance),
            payment: Chq.payment,
            amount: Number(Chq.amount),
        };
        setEditFormData(formValues);
    };

    //Cancel button when clicked on edit
    const handleCancelClick = () => {
        setEditChqOrderJobNumber(null);
        setEditChqMode(null);
    };

    // delete
    const handleDeleteClick = (ChqId) => {
        const newChqList = [...ChqList];
        const index = ChqList.findIndex((Chq) => Chq.id === ChqId);

        Axios.post(`${process.env.REACT_APP_API_URL}/management/deletechq`, {
            Chq_id: ChqId,
            order_job_number: ChqList[index].order_job_number,
        }).then((response) => {
            generatedToast(response);
        });

        newChqList.splice(index, 1);
        setChqList(newChqList);
    };

    const handlePaymentOpenModal = (event, Chq) => {
        event.preventDefault(); // ???

        setEditChqOrderJobNumber(Chq.order_job_number);
        setEditChqMode(Chq.mode);

        const formValues = {
            order_job_number: Chq.order_job_number,
            LA_name: Chq.LA_name,
            LV_name: Chq.LV_name,
            commodity: Chq.commodity,
            mode: Chq.mode,
            chq_amount: Number(Chq.chq_amount),
            chq_issue_date: Chq.chq_issue_date,
            part_pay: Number(Chq.part_pay),
            balance: Number(Chq.chq_amount) - Number(Chq.part_pay),
            payment: Chq.payment,
            amount: Number(Chq.amount),
            payment_chq_no: "",
            payment_chq_amount: Chq.amount,
            payment_chq_date: "",
        };
        formValues.part_pay =
            formValues.part_pay == null ? "Part" : formValues.part_pay;
        setPaymentModalData(formValues);
        openModal();
    };

    const handlePaymentModalFormChange = (event) => {
        event.preventDefault();

        const fieldName = event.target.getAttribute("name");

        const fieldValue = event.target.value;

        errorCheck(fieldValue, fieldName);

        const newFormData = { ...paymentModalData };
        newFormData[fieldName] = fieldValue;

        setPaymentModalData(newFormData);
    };

    const handlePaymentModalFormSubmit = (event) => {
        event.preventDefault(); // ???

        const newPay = {
            order_job_number: paymentModalData.order_job_number,
            LA_name: paymentModalData.LA_name,
            LV_name: paymentModalData.LV_name,
            commodity: paymentModalData.commodity,
            mode: paymentModalData.mode,
            chq_issue_date: paymentModalData.chq_issue_date,
            chq_amount: paymentModalData.chq_amount,
            part_pay: paymentModalData.part_pay,
            balance: paymentModalData.balance,
            payment: paymentModalData.payment,
            amount: paymentModalData.amount,
            payment_chq_no: paymentModalData.payment_chq_no,
            payment_chq_amount: paymentModalData.payment_chq_amount,
            payment_chq_date: paymentModalData.payment_chq_date,
        };

        // api call
        Axios.post(
            `${process.env.REACT_APP_API_URL}/management/insertpayment`,
            newPay
        );

        const editedChq = {
            order_job_number: newPay.order_job_number,
            LA_name: newPay.LA_name,
            LV_name: newPay.LV_name,
            commodity: newPay.commodity,
            mode: newPay.mode,
            chq_amount: newPay.chq_amount,
            chq_issue_date: newPay.chq_issue_date,
            part_pay: Number(newPay.part_pay) + Number(newPay.amount),
            balance:
                Number(newPay.chq_amount) -
                (Number(newPay.part_pay) + Number(newPay.amount)),
            payment: null,
            amount: null,
        };

        Axios.post(
            `${process.env.REACT_APP_API_URL}/management/updatechqPartPay`,
            editedChq
        ).then((response) => {
            generatedToast(response);
        });

        const index = tableData.findIndex(
            (td) =>
                td.order_job_number === editChqOrderJobNumber &&
                td.mode === editChqMode
        );
        tableData[index] = editedChq;
        setChqList(tableData);

        setBtnPayClicked(false);
        setEditChqOrderJobNumber(null);
        setEditChqMode(null);

        closeModal();
    };

    // modal for add Chq
    let [isOpen, setIsOpen] = useState(false);

    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
        setBtnPayClicked(true);
    }

    // loading and error
    if (loading) {
        return <PingLoader />;
    }
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="m-2 mt-2">
            <div className="my-2 mx-auto flex justify-between">
                <input
                    className="mx-auto block w-1/2 rounded-md border-2 border-slate-300 bg-white py-2 shadow-lg placeholder:italic placeholder:text-slate-500 focus:border-green-500 focus:ring-0 sm:text-sm"
                    placeholder="Search for anything..."
                    type="search"
                    name="search"
                    onChange={(event) => setQuery(event.target.value)}
                />
                <Listbox
                    value={filterByShip}
                    onChange={setFilterByShip}
                    className=" w-1/6"
                >
                    <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-green-300 sm:text-sm">
                            <span className="block truncate">
                                {filterByShip.value}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </span>
                        </Listbox.Button>
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full divide-y divide-green-400 overflow-auto rounded-md bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {opt.map((val, idx) => (
                                    <Listbox.Option
                                        key={idx}
                                        className={({ active }) =>
                                            `relative cursor-default select-none rounded-md py-2 pl-10 pr-4 transition duration-100 ease-in-out ${
                                                active
                                                    ? "bg-green-600 text-white"
                                                    : "text-gray-900"
                                            }`
                                        }
                                        value={val}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span
                                                    className={`block truncate ${
                                                        selected
                                                            ? "font-medium"
                                                            : "font-normal"
                                                    }`}
                                                >
                                                    {val.value}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                            active
                                                                ? "font-extrabold text-white"
                                                                : "text-green-600"
                                                        }`}
                                                    >
                                                        <CheckIcon
                                                            className="h-5 w-5"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Transition>
                    </div>
                </Listbox>
            </div>
            <form onSubmit={handleEditFormSubmit}>
                <table className="table">
                    <TableHead
                        columns={TableHeader}
                        handleSorting={handleSorting}
                    />
                    {search(tableData).length > 0 && (
                        <tbody className="divide-y divide-gray-100 rounded-md">
                            {search(tableData).map((_, index) => (
                                <tr
                                    key={index}
                                    className={`my-auto items-center justify-center ${
                                        index % 2 === 1 ? "bg-gray-200" : ""
                                    }`}
                                >
                                    {editChqOrderJobNumber ===
                                        search(tableData)[index]
                                            ?.order_job_number &&
                                    editChqMode ===
                                        search(tableData)[index]?.mode &&
                                    !btnPayClicked ? (
                                        <EditableRow
                                            {...{
                                                editFormData,
                                                handleEditFormChange,
                                                handleCancelClick,
                                            }}
                                        />
                                    ) : (
                                        <ReadOnlyRow
                                            Chq={search(tableData)[index]}
                                            {...{
                                                handleEditClick,
                                                handlePaymentOpenModal,
                                            }}
                                        />
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
                {search(tableData).length < 1 && <NoDataFound />}
            </form>

            {search(tableData).length < data.length && (
                <LoadMore
                    onClick={() => {
                        setPageSize((prevValue) =>
                            cursorPos + prevValue > data.length
                                ? prevValue
                                : prevValue + 20
                        );
                    }}
                />
            )}

            <Suspense fallback={<PingLoader />}>
                <AddPaymentInformation
                    {...{
                        isOpen,
                        closeModal,
                        handlePaymentModalFormSubmit,
                        handlePaymentModalFormChange,
                        paymentModalData,
                        errorData,
                        paymentModalData,
                    }}
                ></AddPaymentInformation>
            </Suspense>

            <Toast />
        </div>
    );
};

export default App;
